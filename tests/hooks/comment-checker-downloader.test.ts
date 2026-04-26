// Ported/adapted from: docs/reference/hooks/comment-checker/downloader.ts
// Adaptations:
// - cache root moved from user cache dirs to CLAUDE_PLUGIN_DATA/comment-checker/bin
// - downloader uses npm tar package, not system tar or a custom parser
// - unsupported zip/Windows assets fail open
// - network, archive, abort, and lock failures return null
// - binary resolver order is env -> plugin-data cache -> PATH -> locked download/recheck

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, linkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import * as tar from "tar";
import { gzipSync } from "node:zlib";

import { getCachedCommentCheckerBinaryPath, resolveCommentCheckerBinary } from "../../src/hooks/comment-checker/binary-resolver.js";
import { downloadCommentCheckerBinary, resolveDefaultCommentCheckerAsset } from "../../src/hooks/comment-checker/downloader.js";
import { createCommentCheckerLockStore } from "../../src/hooks/comment-checker/lock-store.js";

describe("comment-checker downloader and binary resolver", () => {
  it("downloads a tar asset and writes executable binary under plugin-data", async () => {
    await withDownloaderFixture(async (fixture) => {
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: "#!/usr/bin/env bash\nexit 0\n" }]);

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: fileFetch(tarball),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      const expected = join(fixture.dataDir, "comment-checker", "bin", "comment-checker");
      assert.equal(result, expected);
      assert.equal(existsSync(expected), true);
      assert.deepEqual(topLevelEntries(fixture.dataDir), ["comment-checker"]);
    });
  });

  it("rejects a pre-existing final cache symlink without overwriting its target", async () => {
    await withDownloaderFixture(async (fixture) => {
      const target = join(fixture.sourceDir, "outside-target");
      writeFileSync(target, "keep me", "utf8");
      const finalPath = getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux");
      mkdirSync(dirname(finalPath), { recursive: true });
      symlinkSync(target, finalPath);
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: "#!/usr/bin/env bash\nexit 0\n" }]);

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: fileFetch(tarball),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.equal(readFileSync(target, "utf8"), "keep me");
    });
  });

  it("rejects a pre-existing non-regular final cache path before download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const finalPath = getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux");
      mkdirSync(finalPath, { recursive: true });
      let fetchCalled = false;

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => {
          fetchCalled = true;
          return fakeResponse(new Uint8Array());
        },
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.equal(fetchCalled, false);
      assert.deepEqual(topLevelEntries(finalPath), []);
    });
  });

  it("rejects a pre-existing hardlinked final cache path before download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const finalPath = getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux");
      const otherLink = join(fixture.sourceDir, "other-link");
      mkdirSync(dirname(finalPath), { recursive: true });
      writeFileSync(finalPath, "shared", "utf8");
      linkSync(finalPath, otherLink);
      let fetchCalled = false;

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => {
          fetchCalled = true;
          return fakeResponse(new Uint8Array());
        },
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.equal(fetchCalled, false);
      assert.equal(readFileSync(otherLink, "utf8"), "shared");
    });
  });

  it("returns null when plugin-data setup is blocked by a file", async () => {
    await withDownloaderFixture(async (fixture) => {
      const dataFile = join(fixture.sourceDir, "plugin-data-file");
      writeFileSync(dataFile, "not a directory", "utf8");

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: dataFile,
        signal: new AbortController().signal,
        fetch: async () => fakeResponse(new Uint8Array()),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
    });
  });

  it("resolves exact pinned upstream release assets", () => {
    assert.deepEqual(resolveDefaultCommentCheckerAsset("darwin", "x64"), {
      url: "https://github.com/code-yeongyu/go-claude-code-comment-checker/releases/download/v0.7.0/comment-checker_v0.7.0_darwin_amd64.tar.gz",
      expectedSha256: "e64dc7bcab5cdeab7ec9d443ad94740fa96eb6b9c1e3208548250a2d4702b91d"
    });
    assert.deepEqual(resolveDefaultCommentCheckerAsset("darwin", "arm64"), {
      url: "https://github.com/code-yeongyu/go-claude-code-comment-checker/releases/download/v0.7.0/comment-checker_v0.7.0_darwin_arm64.tar.gz",
      expectedSha256: "d30a1e4cdc7b317ada2acb21241eda4e4a677e2f46427f5d244cbefd551f0d7f"
    });
    assert.deepEqual(resolveDefaultCommentCheckerAsset("linux", "x64"), {
      url: "https://github.com/code-yeongyu/go-claude-code-comment-checker/releases/download/v0.7.0/comment-checker_v0.7.0_linux_amd64.tar.gz",
      expectedSha256: "60b98741cd1b06acb247d2d746dda4ff15992e91e39dad2dc0db016ebd655646"
    });
    assert.deepEqual(resolveDefaultCommentCheckerAsset("linux", "arm64"), {
      url: "https://github.com/code-yeongyu/go-claude-code-comment-checker/releases/download/v0.7.0/comment-checker_v0.7.0_linux_arm64.tar.gz",
      expectedSha256: "477317e4beadfe9965091115adde78a8114c644b2269099e1bfd0456ee95c231"
    });
    assert.equal(resolveDefaultCommentCheckerAsset("win32", "x64"), undefined);
    assert.equal(resolveDefaultCommentCheckerAsset("linux", "ia32"), undefined);
  });

  it("rejects mismatched pinned upstream release bytes when assetUrl is omitted", async () => {
    await withDownloaderFixture(async (fixture) => {
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: "#!/usr/bin/env bash\nexit 0\n" }]);
      let fetchedUrl = "";

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async (url) => {
          fetchedUrl = url;
          return fakeResponse(readFileBytes(tarball));
        },
        platform: "linux",
        arch: "x64"
      });

      assert.equal(result, null);
      assert.equal(fetchedUrl, "https://github.com/code-yeongyu/go-claude-code-comment-checker/releases/download/v0.7.0/comment-checker_v0.7.0_linux_amd64.tar.gz");
      assert.equal(existsSync(getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux")), false);
      assert.deepEqual(topLevelEntries(join(fixture.dataDir, "comment-checker", "bin")), []);
    });
  });

  it("verifies configured SHA-256 digest before cache write", async () => {
    await withDownloaderFixture(async (fixture) => {
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: "#!/usr/bin/env bash\nexit 0\n" }]);
      const expectedSha256 = sha256(readFileBytes(tarball));

      const options = {
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: fileFetch(tarball),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz",
        expectedSha256
      } as const;
      const result = await downloadCommentCheckerBinary(options);

      assert.equal(result, getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux"));
    });
  });

  it("rejects SHA-256 mismatches before extraction or cache write", async () => {
    await withDownloaderFixture(async (fixture) => {
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: "#!/usr/bin/env bash\nexit 0\n" }]);
      const expectedSha256 = "0".repeat(64);

      const options = {
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: fileFetch(tarball),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz",
        expectedSha256
      } as const;
      const result = await downloadCommentCheckerBinary(options);

      assert.equal(result, null);
      assert.equal(existsSync(getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux")), false);
      assert.deepEqual(topLevelEntries(join(fixture.dataDir, "comment-checker", "bin")), []);
    });
  });

  it("rejects oversized downloads from content-length before buffering", async () => {
    await withDownloaderFixture(async (fixture) => {
      let arrayBufferCalled = false;

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => ({
          ok: true,
          status: 200,
          headers: { get: (name: string) => name.toLowerCase() === "content-length" ? "26214401" : null },
          arrayBuffer: async () => {
            arrayBufferCalled = true;
            return new ArrayBuffer(0);
          }
        }),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.equal(arrayBufferCalled, false);
    });
  });

  it("resolver uses COMMENT_CHECKER_COMMAND before cache, PATH, or download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const envChecker = writeExecutable(join(fixture.sourceDir, "env-checker"));
      const cachedChecker = writeExecutable(getCachedCommentCheckerBinaryPath(fixture.dataDir));
      let downloadCalled = false;

      const result = await resolveCommentCheckerBinary({
        env: { COMMENT_CHECKER_COMMAND: envChecker, PATH: dirname(cachedChecker) },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return null;
        }
      });

      assert.deepEqual(result, { path: envChecker, source: "env" });
      assert.equal(downloadCalled, false);
    });
  });

  it("resolver reuses cached plugin-data binary before PATH or download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedChecker = writeExecutable(getCachedCommentCheckerBinaryPath(fixture.dataDir));
      const pathDir = join(fixture.sourceDir, "path-bin");
      const pathChecker = writeExecutable(join(pathDir, "comment-checker"));
      let downloadCalled = false;

      const result = await resolveCommentCheckerBinary({
        env: { PATH: pathDir },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return pathChecker;
        }
      });

      assert.deepEqual(result, { path: cachedChecker, source: "plugin-data" });
      assert.equal(downloadCalled, false);
    });
  });

  it("resolver skips unsafe cached symlinks before PATH", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedPath = getCachedCommentCheckerBinaryPath(fixture.dataDir);
      const target = writeExecutable(join(fixture.sourceDir, "target-checker"));
      mkdirSync(dirname(cachedPath), { recursive: true });
      symlinkSync(target, cachedPath);
      const pathDir = join(fixture.sourceDir, "path-bin");
      const pathChecker = writeExecutable(join(pathDir, "comment-checker"));
      let downloadCalled = false;

      const result = await resolveCommentCheckerBinary({
        env: { PATH: pathDir },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return null;
        }
      });

      assert.deepEqual(result, { path: pathChecker, source: "path" });
      assert.equal(downloadCalled, false);
      assert.notEqual(result?.path, cachedPath);
    });
  });

  it("resolver skips unsafe cached hardlinks before PATH", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedPath = writeExecutable(getCachedCommentCheckerBinaryPath(fixture.dataDir));
      linkSync(cachedPath, join(fixture.sourceDir, "other-link"));
      const pathDir = join(fixture.sourceDir, "path-bin");
      const pathChecker = writeExecutable(join(pathDir, "comment-checker"));

      const result = await resolveCommentCheckerBinary({
        env: { PATH: pathDir },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => null
      });

      assert.deepEqual(result, { path: pathChecker, source: "path" });
      assert.notEqual(result?.path, cachedPath);
    });
  });

  it("resolver skips unsafe cached non-regular paths before PATH", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedPath = getCachedCommentCheckerBinaryPath(fixture.dataDir);
      mkdirSync(cachedPath, { recursive: true });
      const pathDir = join(fixture.sourceDir, "path-bin");
      const pathChecker = writeExecutable(join(pathDir, "comment-checker"));

      const result = await resolveCommentCheckerBinary({
        env: { PATH: pathDir },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => null
      });

      assert.deepEqual(result, { path: pathChecker, source: "path" });
      assert.notEqual(result?.path, cachedPath);
    });
  });

  it("download reuses a safe executable cached binary without fetching", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedChecker = writeExecutable(getCachedCommentCheckerBinaryPath(fixture.dataDir, "linux"));
      let fetchCalled = false;

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => {
          fetchCalled = true;
          return fakeResponse(new Uint8Array());
        },
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, cachedChecker);
      assert.equal(fetchCalled, false);
    });
  });

  it("resolver finds comment-checker on PATH before attempting download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const pathDir = join(fixture.sourceDir, "path-bin");
      const pathChecker = writeExecutable(join(pathDir, "comment-checker"));
      let downloadCalled = false;

      const result = await resolveCommentCheckerBinary({
        env: { PATH: pathDir },
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return null;
        }
      });

      assert.deepEqual(result, { path: pathChecker, source: "path" });
      assert.equal(downloadCalled, false);
    });
  });

  it("resolver serializes download with plugin-data lock and rechecks cached binary", async () => {
    await withDownloaderFixture(async (fixture) => {
      let attempts = 0;
      const cachedPath = getCachedCommentCheckerBinaryPath(fixture.dataDir);
      const results = await Promise.all([
        resolveCommentCheckerBinary({ env: {}, pluginDataDir: fixture.dataDir, signal: new AbortController().signal, now: () => 1_000, download: downloadOnce }),
        resolveCommentCheckerBinary({ env: {}, pluginDataDir: fixture.dataDir, signal: new AbortController().signal, now: () => 1_000, download: downloadOnce })
      ]);

      assert.equal(attempts, 1);
      assert.deepEqual(results, [
        { path: cachedPath, source: "plugin-data" },
        { path: cachedPath, source: "plugin-data" }
      ]);

      async function downloadOnce() {
        attempts += 1;
        writeExecutable(cachedPath);
        return cachedPath;
      }
    });
  });

  it("resolver lock recheck skips unsafe cached binaries and uses download result", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedPath = getCachedCommentCheckerBinaryPath(fixture.dataDir);
      mkdirSync(dirname(cachedPath), { recursive: true });
      symlinkSync(writeExecutable(join(fixture.sourceDir, "target-checker")), cachedPath);
      const downloadedPath = writeExecutable(join(fixture.dataDir, "comment-checker", "bin", "downloaded-checker"));
      let downloadCalled = false;

      const result = await resolveCommentCheckerBinary({
        env: {},
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return downloadedPath;
        }
      });

      assert.equal(downloadCalled, true);
      assert.deepEqual(result, { path: downloadedPath, source: "plugin-data" });
      assert.notEqual(result?.path, cachedPath);
    });
  });

  it("resolver wait path refuses unsafe cached binaries after failed download", async () => {
    await withDownloaderFixture(async (fixture) => {
      const cachedPath = getCachedCommentCheckerBinaryPath(fixture.dataDir);
      mkdirSync(dirname(cachedPath), { recursive: true });
      symlinkSync(writeExecutable(join(fixture.sourceDir, "target-checker")), cachedPath);

      const result = await resolveCommentCheckerBinary({
        env: {},
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => null
      });

      assert.equal(result, null);
    });
  });

  it("network failure returns null and does not write outside plugin-data", async () => {
    await withDownloaderFixture(async (fixture) => {
      const beforeSourceEntries = topLevelEntries(fixture.sourceDir);

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => {
          throw new Error("network down");
        },
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.deepEqual(topLevelEntries(fixture.sourceDir), beforeSourceEntries);
    });
  });

  it("returns null promptly when fetch ignores abort", async () => {
    await withDownloaderFixture(async (fixture) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 25).unref();
      const startedAt = Date.now();

      const result = await withTimeout(downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: controller.signal,
        fetch: async () => new Promise(() => {}),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      }), 500);

      assert.equal(result, null);
      assert.ok(Date.now() - startedAt < 500);
    });
  });

  it("returns null promptly when arrayBuffer ignores abort", async () => {
    await withDownloaderFixture(async (fixture) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 25).unref();
      const startedAt = Date.now();

      const result = await withTimeout(downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: controller.signal,
        fetch: async () => ({
          ok: true,
          status: 200,
          arrayBuffer: async () => new Promise(() => {})
        }),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      }), 500);

      assert.equal(result, null);
      assert.ok(Date.now() - startedAt < 500);
    });
  });

  it("unsupported Windows zip asset returns null fail-open", async () => {
    await withDownloaderFixture(async (fixture) => {
      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: async () => fakeResponse(new Uint8Array()),
        platform: "win32",
        arch: "x64"
      });

      assert.equal(result, null);
    });
  });

  it("archive links are rejected and cannot escape the bin directory", async () => {
    await withDownloaderFixture(async (fixture) => {
      const target = join(fixture.sourceDir, "target");
      const symlink = join(fixture.sourceDir, "comment-checker");
      writeFileSync(target, "not a regular archive entry copy", "utf8");
      symlinkSync(target, symlink);
      const tarball = await createTarball(fixture.sourceDir, [{ name: "comment-checker", content: undefined }]);

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: new AbortController().signal,
        fetch: fileFetch(tarball),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
      assert.equal(existsSync(join(fixture.dataDir, "evil")), false);
    });
  });

  it("rejects unsafe tar entries for absolute paths, traversal, hardlinks, devices, and directories", async () => {
    await withDownloaderFixture(async (fixture) => {
      const unsafeTarballs = [
        createRawTarball(fixture.sourceDir, "absolute.tar.gz", [{ path: "/comment-checker", type: "0", body: "binary" }]),
        createRawTarball(fixture.sourceDir, "traversal.tar.gz", [{ path: "../comment-checker", type: "0", body: "binary" }]),
        createRawTarball(fixture.sourceDir, "hardlink.tar.gz", [{ path: "comment-checker", type: "1", linkpath: "target" }]),
        createRawTarball(fixture.sourceDir, "device.tar.gz", [{ path: "comment-checker", type: "3" }]),
        createRawTarball(fixture.sourceDir, "directory.tar.gz", [{ path: "comment-checker", type: "5" }])
      ];

      for (const tarball of unsafeTarballs) {
        const result = await downloadCommentCheckerBinary({
          pluginDataDir: fixture.dataDir,
          signal: new AbortController().signal,
          fetch: fileFetch(tarball),
          platform: "linux",
          arch: "x64",
          assetUrl: "https://example.invalid/comment-checker.tar.gz"
        });

        assert.equal(result, null, tarball);
        assert.equal(existsSync(join(fixture.dataDir, "comment-checker", "bin", "comment-checker")), false);
      }
    });
  });

  it("recovers stale plugin-data download locks", async () => {
    await withDownloaderFixture(async (fixture) => {
      const lockDir = join(fixture.dataDir, "comment-checker", "locks", "download.lock");
      mkdirSync(lockDir, { recursive: true });
      writeFileSync(join(lockDir, "owner.json"), `${JSON.stringify({ pid: 1, createdAt: 1_000, token: "stale" })}\n`, "utf8");
      const lockStore = createCommentCheckerLockStore({ pluginDataDir: fixture.dataDir, now: () => 3_000, staleLockMs: 500 });

      const result = await lockStore.withLock("download", async () => "acquired");

      assert.equal(result, "acquired");
      assert.equal(existsSync(lockDir), false);
    });
  });

  it("fails open when plugin-data lock acquisition cannot create lock directory", async () => {
    await withDownloaderFixture(async (fixture) => {
      const dataFile = join(fixture.sourceDir, "not-a-directory");
      writeFileSync(dataFile, "file blocks mkdir", "utf8");
      const lockStore = createCommentCheckerLockStore({ pluginDataDir: dataFile, now: () => 1_000 });
      let downloadCalled = false;

      assert.equal(await lockStore.withLock("download", async () => "should-not-run"), null);
      assert.equal(await resolveCommentCheckerBinary({
        env: {},
        pluginDataDir: dataFile,
        signal: new AbortController().signal,
        now: () => 1_000,
        download: async () => {
          downloadCalled = true;
          return null;
        }
      }), null);
      assert.equal(downloadCalled, false);
    });
  });

  it("aborted download returns null without throwing", async () => {
    await withDownloaderFixture(async (fixture) => {
      const controller = new AbortController();
      controller.abort();

      const result = await downloadCommentCheckerBinary({
        pluginDataDir: fixture.dataDir,
        signal: controller.signal,
        fetch: async () => fakeResponse(new Uint8Array()),
        platform: "linux",
        arch: "x64",
        assetUrl: "https://example.invalid/comment-checker.tar.gz"
      });

      assert.equal(result, null);
    });
  });
});

interface DownloaderFixture {
  readonly dataDir: string;
  readonly sourceDir: string;
}

async function withDownloaderFixture(run: (fixture: DownloaderFixture) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "comment-checker-downloader-"));
  const dataDir = join(root, "plugin-data");
  const sourceDir = join(root, "source");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(sourceDir, { recursive: true });
  try {
    await run({ dataDir, sourceDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function createTarball(sourceDir: string, entries: readonly { readonly name: string; readonly content: string | undefined }[]): Promise<string> {
  for (const entry of entries) {
    if (entry.content !== undefined) {
      const path = join(sourceDir, entry.name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, entry.content, "utf8");
    }
  }
  const tarball = join(sourceDir, "asset.tar.gz");
  await tar.c({ gzip: true, file: tarball, cwd: sourceDir }, entries.map((entry) => entry.name));
  return tarball;
}

function fileFetch(path: string) {
  return async () => fakeResponse(readFileBytes(path));
}

function fakeResponse(body: Uint8Array) {
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
  };
}

function readFileBytes(path: string): Uint8Array {
  return new Uint8Array(Buffer.from(readFileSync(path)));
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function writeExecutable(path: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "#!/usr/bin/env bash\nexit 0\n", "utf8");
  chmodSync(path, 0o755);
  return path;
}

function topLevelEntries(path: string): string[] {
  return existsSync(path) ? readdirSync(path).sort() : [];
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | "timed-out"> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<"timed-out">((resolve) => {
        timeout = setTimeout(() => resolve("timed-out"), timeoutMs);
      })
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}

interface RawTarEntry {
  readonly path: string;
  readonly type: "0" | "1" | "3" | "5";
  readonly body?: string | undefined;
  readonly linkpath?: string | undefined;
}

function createRawTarball(sourceDir: string, name: string, entries: readonly RawTarEntry[]): string {
  const chunks: Buffer[] = [];
  for (const entry of entries) {
    const body = Buffer.from(entry.body ?? "", "utf8");
    chunks.push(createTarHeader(entry, body.length));
    if (entry.type === "0") {
      chunks.push(body);
      const padding = (512 - (body.length % 512)) % 512;
      if (padding > 0) {
        chunks.push(Buffer.alloc(padding));
      }
    }
  }
  chunks.push(Buffer.alloc(1024));
  const tarball = join(sourceDir, name);
  writeFileSync(tarball, gzipSync(Buffer.concat(chunks)));
  return tarball;
}

function createTarHeader(entry: RawTarEntry, size: number): Buffer {
  const header = Buffer.alloc(512, 0);
  writeString(header, entry.path, 0, 100);
  writeOctal(header, 0o755, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, entry.type === "0" ? size : 0, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  writeString(header, entry.type, 156, 1);
  writeString(header, entry.linkpath ?? "", 157, 100);
  writeString(header, "ustar", 257, 6);
  writeString(header, "00", 263, 2);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeOctal(header, checksum, 148, 8);
  return header;
}

function writeString(buffer: Buffer, value: string, offset: number, length: number): void {
  buffer.write(value.slice(0, length), offset, length, "utf8");
}

function writeOctal(buffer: Buffer, value: number, offset: number, length: number): void {
  const encoded = value.toString(8).padStart(length - 1, "0").slice(0, length - 1);
  buffer.write(`${encoded}\0`, offset, length, "ascii");
}
