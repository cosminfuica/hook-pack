import assert from "node:assert/strict";
import { existsSync, mkdirSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import {
  canonicalizeExistingOrParent,
  extractToolPath,
  isPathInsideDirectory,
  resolveToolPath
} from "../../src/hooks/shared/path.js";
import { withHookFixture } from "../helpers/hook-fixtures.js";

describe("shared path helpers", () => {
  it("extractToolPath reads file_path, filePath, and path aliases in priority order", () => {
    assert.equal(extractToolPath({ file_path: "from-snake", filePath: "from-camel", path: "from-path" }), "from-snake");
    assert.equal(extractToolPath({ filePath: "from-camel", path: "from-path" }), "from-camel");
    assert.equal(extractToolPath({ path: "from-path" }), "from-path");
  });

  it("extractToolPath returns undefined for missing, non-string, and empty path values", () => {
    assert.equal(extractToolPath(undefined), undefined);
    assert.equal(extractToolPath({ file_path: "" }), undefined);
    assert.equal(extractToolPath({ file_path: "   " }), undefined);
    assert.equal(extractToolPath({ path: 42 }), undefined);
  });

  it("resolveToolPath resolves relatives against cwd and keeps absolutes", () => {
    assert.equal(resolveToolPath("/repo", "src/file.ts"), resolve("/repo", "src/file.ts"));
    assert.equal(resolveToolPath("/repo", "/tmp/file.ts"), "/tmp/file.ts");
  });

  it("isPathInsideDirectory rejects sibling-prefix attacks", () => {
    assert.equal(isPathInsideDirectory("/repo", "/repo/src/file.ts"), true);
    assert.equal(isPathInsideDirectory("/repo", "/repo"), true);
    assert.equal(isPathInsideDirectory("/repo", "/repo-other/file.ts"), false);
    assert.equal(isPathInsideDirectory("/repo", "/tmp/file.ts"), false);
  });

  it("canonicalizeExistingOrParent follows symlinks for existing leaves", async () => {
    await withHookFixture(({ cwd }) => {
      const realDir = join(cwd, "real");
      const linkDir = join(cwd, "link");
      mkdirSync(realDir, { recursive: true });
      writeFileSync(join(realDir, "file.ts"), "content", "utf8");
      symlinkSync(realDir, linkDir, "dir");

      assert.equal(canonicalizeExistingOrParent(join(linkDir, "file.ts")), realpathSync(join(realDir, "file.ts")));
    });
  });

  it("canonicalizeExistingOrParent resolves parent realpath plus leaf basename for missing leaves", async () => {
    await withHookFixture(({ cwd }) => {
      const realDir = join(cwd, "real");
      const linkDir = join(cwd, "link");
      mkdirSync(realDir, { recursive: true });
      symlinkSync(realDir, linkDir, "dir");

      assert.equal(canonicalizeExistingOrParent(join(linkDir, "missing.ts")), join(realpathSync(realDir), "missing.ts"));
      assert.equal(existsSync(join(linkDir, "missing.ts")), false);
    });
  });
});
