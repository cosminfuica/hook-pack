import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

import { withFileLock } from "./file-lock.js";
import { parseRuleFrontmatter } from "./frontmatter.js";
import { canonicalizeExistingOrParent, isPathInsideDirectory } from "./path.js";
import { createContentHash, isDuplicateByRealPath, shouldApplyRule, type RuleMetadata } from "./rule-discovery-matcher.js";

export const PROJECT_MARKERS = [".git", "pyproject.toml", "package.json", "Cargo.toml", "go.mod"];

export const PROJECT_RULE_SUBDIRS: ReadonlyArray<readonly [string, string]> = [
  [".github", "instructions"],
  [".cursor", "rules"],
  [".claude", "rules"]
];

export const PROJECT_RULE_FILES: readonly string[] = [".github/copilot-instructions.md"];

export const USER_RULE_SUBDIRS: ReadonlyArray<readonly [string, string]> = [
  [".github", "instructions"],
  [".cursor", "rules"],
  [".claude", "rules"]
];

export const RULE_EXTENSIONS = [".md", ".mdc"];

export const GITHUB_INSTRUCTIONS_PATTERN = /\.instructions\.md$/;

export const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "coverage", ".venv", "build", "target"]);

export const USER_HOME_RULE_DISTANCE = 9999;

export interface MatchingRuleBlock {
  readonly absolutePath: string;
  readonly realpath: string;
  readonly projectRelativePath: string;
  readonly distance: number;
  readonly body: string;
  readonly bodyHash: string;
  readonly matchReason: string;
}

export interface LoadMatchingRulesOptions {
  readonly projectRoot: string;
  readonly targetPath: string;
  readonly homedir?: string | undefined;
  readonly includeUserRules: boolean;
  readonly scanCache?: RuleScanCache | undefined;
  readonly parsedRuleCache?: ParsedRuleCacheLike | undefined;
}

export interface RuleScanCache {
  readonly get: (key: string) => readonly string[] | undefined;
  readonly set: (key: string, value: readonly string[]) => void;
  readonly clear: () => void;
}

export interface ParsedRuleCacheLike {
  readonly load: (realpath: string, mtimeMs: number, size: number) => CachedParsedRule | undefined;
  readonly store: (realpath: string, entry: CachedParsedRule) => boolean;
}

export interface CachedParsedRule {
  readonly mtimeMs: number;
  readonly size: number;
  readonly metadata: Record<string, unknown>;
  readonly body: string;
}

interface RuleFileCandidate {
  readonly absolutePath: string;
  readonly realpath: string;
  readonly isUserRule: boolean;
  readonly distance: number;
  readonly isSingleFile: boolean;
}

interface RuleScanCacheEnvelope {
  readonly entries?: Record<string, readonly string[]>;
}

export function findProjectRoot(startPath: string, cwdBoundary: string): string | undefined {
  const boundary = canonicalizeExistingOrParent(cwdBoundary);
  const start = canonicalizeExistingOrParent(startPath);
  if (!isPathInsideDirectory(boundary, start)) {
    return undefined;
  }

  let current = getStartDirectory(start);
  while (isPathInsideDirectory(boundary, current)) {
    if (PROJECT_MARKERS.some((marker) => existsSync(join(current, marker)))) {
      return current;
    }

    if (current === boundary) {
      return boundary;
    }

    const parent = dirname(current);
    if (parent === current) {
      return boundary;
    }
    current = parent;
  }

  return boundary;
}

export function loadMatchingRules(options: LoadMatchingRulesOptions): MatchingRuleBlock[] {
  const projectRoot = canonicalizeExistingOrParent(options.projectRoot);
  const targetPath = resolve(options.targetPath);
  const startDir = getStartDirectory(targetPath);
  const cacheKey = createScanCacheKey(projectRoot, startDir, options.homedir, options.includeUserRules);
  const candidates = loadCandidates(projectRoot, startDir, options.homedir, options.includeUserRules, options.scanCache, cacheKey);
  const matched: MatchingRuleBlock[] = [];

  for (const candidate of candidates) {
    try {
      const parsed = readParsedRule(candidate, options.parsedRuleCache);
      const matchReason = candidate.isSingleFile ? "copilot-instructions (always apply)" : shouldApplyRule(parsed.metadata, targetPath, projectRoot).reason;
      if (matchReason === undefined) {
        continue;
      }

      matched.push({
        absolutePath: candidate.absolutePath,
        realpath: candidate.realpath,
        projectRelativePath: createDisplayPath(candidate.absolutePath, projectRoot, options.homedir),
        distance: candidate.distance,
        body: parsed.body,
        bodyHash: createContentHash(parsed.body),
        matchReason
      });
    } catch {
      continue;
    }
  }

  return matched.sort(compareRuleBlocks);
}

export function findRuleFilesRecursive(dir: string, results: string[]): void {
  if (!existsSync(dir)) {
    return;
  }

  try {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          findRuleFilesRecursive(fullPath, results);
        }
      } else if (entry.isFile() && isValidRuleFile(entry.name, dir)) {
        results.push(fullPath);
      }
    }
  } catch {
    // Best-effort rule discovery: unreadable directories are skipped.
  }
}

export function safeRealpathSync(filePath: string): string {
  try {
    return realpathSync(filePath);
  } catch {
    return filePath;
  }
}

export function createFileBackedRuleScanCache(cachePath: string): RuleScanCache {
  return {
    get: (key) => readScanCache(cachePath).entries?.[key],
    set: (key, value) => {
      const lockPath = join(dirname(cachePath), ".locks", basename(cachePath));
      withFileLock(lockPath, () => {
        const current = readScanCache(cachePath).entries ?? {};
        return writeScanCache(cachePath, { entries: { ...current, [key]: [...value] } });
      });
    },
    clear: () => {
      try {
        rmSync(cachePath, { force: true });
      } catch {
        // Best-effort cache cleanup: missing/unremovable cache is non-fatal.
      }
    }
  };
}

function loadCandidates(
  projectRoot: string,
  startDir: string,
  homeDir: string | undefined,
  includeUserRules: boolean,
  scanCache: RuleScanCache | undefined,
  cacheKey: string
): RuleFileCandidate[] {
  const cachedPaths = scanCache?.get(cacheKey);
  if (cachedPaths !== undefined) {
    return dedupeCandidates(cachedPaths.flatMap((filePath) => cachedCandidate(filePath, projectRoot, startDir, homeDir, includeUserRules)));
  }

  const candidates = discoverCandidates(projectRoot, startDir, homeDir, includeUserRules);
  scanCache?.set(cacheKey, candidates.map((candidate) => candidate.absolutePath));
  return candidates;
}

function discoverCandidates(projectRoot: string, startDir: string, homeDir: string | undefined, includeUserRules: boolean): RuleFileCandidate[] {
  const candidates: RuleFileCandidate[] = [];
  const seenRealpaths = new Set<string>();
  let currentDir = startDir;
  let distance = 0;

  while (isPathInsideDirectory(projectRoot, currentDir)) {
    for (const [parent, subdir] of PROJECT_RULE_SUBDIRS) {
      collectRuleDir(join(currentDir, parent, subdir), false, distance, candidates, seenRealpaths);
    }

    if (currentDir === projectRoot) {
      break;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
    distance += 1;
  }

  for (const ruleFile of PROJECT_RULE_FILES) {
    const absolutePath = join(projectRoot, ruleFile);
    if (!isFile(absolutePath)) {
      continue;
    }
    pushCandidate({ absolutePath, isUserRule: false, distance: 0, isSingleFile: true }, candidates, seenRealpaths);
  }

  if (includeUserRules && homeDir !== undefined) {
    for (const [parent, subdir] of USER_RULE_SUBDIRS) {
      collectRuleDir(join(homeDir, parent, subdir), true, USER_HOME_RULE_DISTANCE, candidates, seenRealpaths);
    }
  }

  return candidates.sort(compareCandidates);
}

function collectRuleDir(
  ruleDir: string,
  isUserRule: boolean,
  distance: number,
  candidates: RuleFileCandidate[],
  seenRealpaths: Set<string>
): void {
  const files: string[] = [];
  findRuleFilesRecursive(ruleDir, files);
  for (const absolutePath of files) {
    pushCandidate({ absolutePath, isUserRule, distance, isSingleFile: false }, candidates, seenRealpaths);
  }
}

function pushCandidate(
  input: Omit<RuleFileCandidate, "realpath">,
  candidates: RuleFileCandidate[],
  seenRealpaths: Set<string>
): void {
  const realpath = safeRealpathSync(input.absolutePath);
  if (isDuplicateByRealPath(realpath, seenRealpaths)) {
    return;
  }
  seenRealpaths.add(realpath);
  candidates.push({ ...input, realpath });
}

function cachedCandidate(
  absolutePath: string,
  projectRoot: string,
  startDir: string,
  homeDir: string | undefined,
  includeUserRules: boolean
): RuleFileCandidate[] {
  const normalizedPath = resolve(absolutePath);
  for (const ruleFile of PROJECT_RULE_FILES) {
    if (normalizedPath === join(projectRoot, ruleFile)) {
      return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: false, distance: 0, isSingleFile: true }];
    }
  }

  let currentDir = startDir;
  let distance = 0;
  while (isPathInsideDirectory(projectRoot, currentDir)) {
    for (const [parent, subdir] of PROJECT_RULE_SUBDIRS) {
      if (isPathInsideDirectory(join(currentDir, parent, subdir), normalizedPath)) {
        return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: false, distance, isSingleFile: false }];
      }
    }

    if (currentDir === projectRoot) {
      break;
    }
    currentDir = dirname(currentDir);
    distance += 1;
  }

  if (includeUserRules && homeDir !== undefined) {
    for (const [parent, subdir] of USER_RULE_SUBDIRS) {
      if (isPathInsideDirectory(join(homeDir, parent, subdir), normalizedPath)) {
        return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: true, distance: USER_HOME_RULE_DISTANCE, isSingleFile: false }];
      }
    }
  }

  return [];
}

function dedupeCandidates(candidates: readonly RuleFileCandidate[]): RuleFileCandidate[] {
  const seenRealpaths = new Set<string>();
  const deduped: RuleFileCandidate[] = [];
  for (const candidate of candidates) {
    if (!seenRealpaths.has(candidate.realpath)) {
      seenRealpaths.add(candidate.realpath);
      deduped.push(candidate);
    }
  }
  return deduped.sort(compareCandidates);
}

function readParsedRule(candidate: RuleFileCandidate, parsedRuleCache: ParsedRuleCacheLike | undefined): { metadata: RuleMetadata; body: string } {
  const stat = statSync(candidate.absolutePath);
  const cached = parsedRuleCache?.load(candidate.realpath, stat.mtimeMs, stat.size);
  if (cached !== undefined) {
    return { metadata: toRuleMetadata(cached.metadata), body: cached.body };
  }

  const parsed = parseRuleFrontmatter(readFileSync(candidate.absolutePath, "utf8"));
  const metadata = toRuleMetadata(metadataToRecord(parsed.metadata));
  const normalized = { metadata, body: parsed.body };
  parsedRuleCache?.store(candidate.realpath, {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    metadata: metadataToRecord(normalized.metadata),
    body: normalized.body
  });
  return normalized;
}

function isValidRuleFile(fileName: string, dir: string): boolean {
  if (isGitHubInstructionsDir(dir)) {
    return GITHUB_INSTRUCTIONS_PATTERN.test(fileName);
  }
  return RULE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

function isGitHubInstructionsDir(dir: string): boolean {
  const normalized = dir.replaceAll("\\", "/");
  return normalized.includes("/.github/instructions") || normalized.endsWith(".github/instructions");
}

function createDisplayPath(absolutePath: string, projectRoot: string, homeDir: string | undefined): string {
  if (isPathInsideDirectory(projectRoot, absolutePath)) {
    return normalizePath(relative(projectRoot, absolutePath));
  }
  if (homeDir !== undefined && isPathInsideDirectory(homeDir, absolutePath)) {
    return `~/${normalizePath(relative(homeDir, absolutePath))}`;
  }
  return normalizePath(absolutePath);
}

function compareCandidates(left: RuleFileCandidate, right: RuleFileCandidate): number {
  if (left.isUserRule !== right.isUserRule) {
    return left.isUserRule ? 1 : -1;
  }
  const distance = left.distance - right.distance;
  return distance === 0 ? left.absolutePath.localeCompare(right.absolutePath) : distance;
}

function compareRuleBlocks(left: MatchingRuleBlock, right: MatchingRuleBlock): number {
  const distance = left.distance - right.distance;
  return distance === 0 ? left.projectRelativePath.localeCompare(right.projectRelativePath) : distance;
}

function createScanCacheKey(projectRoot: string, startDir: string, homeDir: string | undefined, includeUserRules: boolean): string {
  return `${projectRoot}|${startDir}|${homeDir ?? ""}|${includeUserRules ? "1" : "0"}`;
}

function getStartDirectory(startPath: string): string {
  try {
    return statSync(startPath).isDirectory() ? startPath : dirname(startPath);
  } catch {
    return dirname(startPath);
  }
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function toRuleMetadata(metadata: Record<string, unknown>): RuleMetadata {
  const globs = metadata.globs;
  return {
    ...(typeof metadata.description === "string" ? { description: metadata.description } : {}),
    ...(typeof metadata.alwaysApply === "boolean" ? { alwaysApply: metadata.alwaysApply } : {}),
    ...(typeof globs === "string" || isStringArray(globs) ? { globs } : {})
  };
}

function metadataToRecord(metadata: RuleMetadata): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  if (metadata.description !== undefined) {
    record.description = metadata.description;
  }
  if (metadata.globs !== undefined) {
    record.globs = metadata.globs;
  }
  if (metadata.alwaysApply !== undefined) {
    record.alwaysApply = metadata.alwaysApply;
  }
  return record;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function readScanCache(cachePath: string): RuleScanCacheEnvelope {
  try {
    const parsed: unknown = JSON.parse(readFileSync(cachePath, "utf8"));
    if (!isRecord(parsed) || !Object.hasOwn(parsed, "entries")) {
      return {};
    }
    const entries = parsed.entries;
    if (entries !== undefined && !isScanCacheEntries(entries)) {
      return {};
    }
    return entries === undefined ? {} : { entries };
  } catch {
    return {};
  }
}

function writeScanCache(cachePath: string, envelope: RuleScanCacheEnvelope): boolean {
  try {
    mkdirSync(dirname(cachePath), { recursive: true });
    const tempPath = join(dirname(cachePath), `${basename(cachePath)}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`);
    writeFileSync(tempPath, `${JSON.stringify(envelope)}\n`, "utf8");
    renameSync(tempPath, cachePath);
    return true;
  } catch {
    return false;
  }
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isScanCacheEntries(value: unknown): value is Record<string, readonly string[]> {
  return isRecord(value) && Object.values(value).every((entry) => Array.isArray(entry) && entry.every((item) => typeof item === "string"));
}
