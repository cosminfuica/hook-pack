import { createHash } from "node:crypto";
import { constants, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { access, chmod, lstat, mkdtemp, open, readFile, rename, rm } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import * as tar from "tar";

import { getCachedCommentCheckerBinaryPath } from "./binary-resolver.js";

export interface DownloadCommentCheckerBinaryOptions {
  readonly pluginDataDir: string | undefined;
  readonly signal: AbortSignal;
  readonly fetch?: FetchLike | undefined;
  readonly platform?: NodeJS.Platform | undefined;
  readonly arch?: NodeJS.Architecture | undefined;
  readonly assetUrl?: string | undefined;
  readonly expectedSha256?: string | undefined;
}

export type FetchLike = (url: string, init?: { readonly signal?: AbortSignal | undefined }) => Promise<FetchResponseLike>;

export interface FetchResponseLike {
  readonly ok: boolean;
  readonly status: number;
  readonly headers?: { readonly get: (name: string) => string | null } | undefined;
  readonly arrayBuffer: () => Promise<ArrayBuffer | SharedArrayBuffer>;
}

export interface DefaultCommentCheckerAsset {
  readonly url: string;
  readonly expectedSha256: string;
}

const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const DEFAULT_RELEASE_VERSION = "0.7.0";
const RELEASE_REPOSITORY = "code-yeongyu/go-claude-code-comment-checker";

export async function downloadCommentCheckerBinary(options: DownloadCommentCheckerBinaryOptions): Promise<string | null> {
  if (options.pluginDataDir === undefined || options.signal.aborted) {
    return null;
  }

  let tempRoot: string | undefined;
  try {
    const platform = options.platform ?? process.platform;
    const arch = options.arch ?? process.arch;
    const customAssetUrl = cleanOptionalUrl(options.assetUrl);
    const defaultAsset = customAssetUrl === undefined ? resolveDefaultCommentCheckerAsset(platform, arch) : undefined;
    const assetUrl = customAssetUrl ?? defaultAsset?.url;
    const expectedSha256 = customAssetUrl === undefined ? defaultAsset?.expectedSha256 : options.expectedSha256;
    if (assetUrl === undefined || assetUrl.endsWith(".zip")) {
      return null;
    }

    const binDir = join(options.pluginDataDir, "comment-checker", "bin");
    const binaryPath = getCachedCommentCheckerBinaryPath(options.pluginDataDir, platform);
    mkdirSync(dirname(binaryPath), { recursive: true });
    if (await isSafeExecutable(binaryPath)) {
      return binaryPath;
    }
    if (!await isAbsentOrSafeRegularPath(binaryPath)) {
      return null;
    }

    tempRoot = await makeTempDir(binDir);
    const response = await abortable((options.fetch ?? fetch)(assetUrl, { signal: options.signal }), options.signal);
    if (!response.ok || options.signal.aborted) {
      return null;
    }
    if (isOversizedResponse(response)) {
      return null;
    }

    const buffer = Buffer.from(await abortable(response.arrayBuffer(), options.signal));
    if (options.signal.aborted || buffer.byteLength > MAX_DOWNLOAD_BYTES) {
      return null;
    }
    if (!matchesExpectedSha256(buffer, expectedSha256)) {
      return null;
    }

    const archivePath = join(tempRoot, "comment-checker.tar.gz");
    writeFileSync(archivePath, buffer);
    const extractedPath = await extractSafeBinary({ archivePath, tempRoot, binDir, binaryName: basename(binaryPath), signal: options.signal });
    if (extractedPath === null || options.signal.aborted) {
      return null;
    }

    if (!await isSafeRegularPath(extractedPath)) {
      return null;
    }

    const tempBinaryPath = join(binDir, `.comment-checker-${process.pid}-${Date.now()}`);
    const binary = await readFile(extractedPath);
    await writeFreshTempBinary(tempBinaryPath, binary);
    if (!await isSafeRegularPath(tempBinaryPath) || !await isAbsentOrSafeRegularPath(binaryPath)) {
      await rm(tempBinaryPath, { force: true }).catch(() => undefined);
      return null;
    }
    await chmod(tempBinaryPath, 0o755);
    await rename(tempBinaryPath, binaryPath);
    if (!await isSafeRegularPath(binaryPath)) {
      return null;
    }
    return await isExecutable(binaryPath) ? binaryPath : null;
  } catch {
    return null;
  } finally {
    if (tempRoot !== undefined) {
      await rm(tempRoot, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

export function resolveDefaultCommentCheckerAsset(platform: NodeJS.Platform, arch: NodeJS.Architecture): DefaultCommentCheckerAsset | undefined {
  if (platform === "win32") {
    return undefined;
  }
  const platformName = platform === "darwin" ? "darwin" : platform === "linux" ? "linux" : undefined;
  const archName = arch === "x64" ? "amd64" : arch === "arm64" ? "arm64" : undefined;
  if (platformName === undefined || archName === undefined) {
    return undefined;
  }
  const expectedSha256 = resolveDefaultCommentCheckerSha256(platform, arch);
  if (expectedSha256 === undefined) {
    return undefined;
  }
  return {
    url: `https://github.com/${RELEASE_REPOSITORY}/releases/download/v${DEFAULT_RELEASE_VERSION}/comment-checker_v${DEFAULT_RELEASE_VERSION}_${platformName}_${archName}.tar.gz`,
    expectedSha256
  };
}

function resolveDefaultCommentCheckerSha256(platform: NodeJS.Platform, arch: NodeJS.Architecture): string | undefined {
  if (platform === "darwin" && arch === "x64") {
    return "e64dc7bcab5cdeab7ec9d443ad94740fa96eb6b9c1e3208548250a2d4702b91d";
  }
  if (platform === "darwin" && arch === "arm64") {
    return "d30a1e4cdc7b317ada2acb21241eda4e4a677e2f46427f5d244cbefd551f0d7f";
  }
  if (platform === "linux" && arch === "x64") {
    return "60b98741cd1b06acb247d2d746dda4ff15992e91e39dad2dc0db016ebd655646";
  }
  if (platform === "linux" && arch === "arm64") {
    return "477317e4beadfe9965091115adde78a8114c644b2269099e1bfd0456ee95c231";
  }
  return undefined;
}

async function makeTempDir(binDir: string): Promise<string> {
  mkdirSync(binDir, { recursive: true });
  return mkdtemp(join(binDir, ".download-"));
}

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    throw new Error("aborted");
  }

  let abortListener: (() => void) | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        abortListener = () => reject(new Error("aborted"));
        signal.addEventListener("abort", abortListener, { once: true });
      })
    ]);
  } finally {
    if (abortListener !== undefined) {
      signal.removeEventListener("abort", abortListener);
    }
  }
}

async function extractSafeBinary(options: {
  readonly archivePath: string;
  readonly tempRoot: string;
  readonly binDir: string;
  readonly binaryName: string;
  readonly signal: AbortSignal;
}): Promise<string | null> {
  let extractedPath: string | null = null;
  const extractDir = join(options.tempRoot, "extract");
  mkdirSync(extractDir, { recursive: true });
  const canonicalBinDir = resolve(options.binDir);

  try {
    let unsafeArchiveEntry = false;
    await tar.t({
      file: options.archivePath,
      onentry: (entry) => {
        if (options.signal.aborted || !isSafeArchiveEntry(entry.path, entry.type, canonicalBinDir)) {
          unsafeArchiveEntry = true;
        }
      }
    });

    if (unsafeArchiveEntry) {
      return null;
    }

    await tar.x({
      file: options.archivePath,
      cwd: extractDir,
      filter: (path) => isSafeArchivePath(path, canonicalBinDir)
    });

    const candidate = join(extractDir, options.binaryName);
    if (existsSync(candidate)) {
      extractedPath = candidate;
    } else {
      extractedPath = join(extractDir, "comment-checker");
    }

    return existsSync(extractedPath) ? extractedPath : null;
  } catch {
    rmSync(extractDir, { recursive: true, force: true });
    return null;
  }
}

function isSafeArchiveEntry(entryPath: string, type: string, canonicalBinDir: string): boolean {
  if (type !== "File") {
    return false;
  }
  return isSafeArchivePath(entryPath, canonicalBinDir);
}

function isSafeArchivePath(entryPath: string, canonicalBinDir: string): boolean {
  const normalized = normalize(entryPath);
  if (isAbsolute(entryPath) || normalized.startsWith("..") || normalized.includes(`${sep}..${sep}`)) {
    return false;
  }
  const destination = resolve(canonicalBinDir, normalized);
  const relativePath = relative(canonicalBinDir, destination);
  return relativePath !== "" && !relativePath.startsWith("..") && !isAbsolute(relativePath);
}

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function cleanOptionalUrl(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function isOversizedResponse(response: FetchResponseLike): boolean {
  const contentLength = response.headers?.get("content-length");
  if (contentLength === undefined || contentLength === null || contentLength.trim() === "") {
    return false;
  }
  const size = Number(contentLength);
  return Number.isFinite(size) && size > MAX_DOWNLOAD_BYTES;
}

function matchesExpectedSha256(buffer: Buffer, expectedSha256: string | undefined): boolean {
  if (expectedSha256 === undefined) {
    return true;
  }
  const normalized = expectedSha256.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    return false;
  }
  const actual = createHash("sha256").update(buffer).digest("hex");
  return actual === normalized;
}

async function writeFreshTempBinary(path: string, content: Buffer): Promise<void> {
  const file = await open(path, "wx", 0o700);
  try {
    await file.writeFile(content);
  } finally {
    await file.close();
  }
}

async function isAbsentOrSafeRegularPath(path: string): Promise<boolean> {
  try {
    return isSafeStats(await lstat(path));
  } catch (error) {
    return isNodeErrorWithCode(error, "ENOENT");
  }
}

async function isSafeRegularPath(path: string): Promise<boolean> {
  try {
    return isSafeStats(await lstat(path));
  } catch {
    return false;
  }
}

async function isSafeExecutable(path: string): Promise<boolean> {
  return await isSafeRegularPath(path) && await isExecutable(path);
}

function isSafeStats(stats: { readonly isFile: () => boolean; readonly isSymbolicLink: () => boolean; readonly nlink: number }): boolean {
  return stats.isFile() && !stats.isSymbolicLink() && stats.nlink <= 1;
}

function isNodeErrorWithCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}
