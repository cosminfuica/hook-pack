// Ported from: docs/reference/hooks/rules-injector/project-root-finder.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - mocked node:fs memoization case -> filesystem-backed boundary tests for canonical cwdBoundary behavior
// Dropped reference cases:
// - None.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { findProjectRoot } from "../../src/hooks/shared/rule-discovery.js";

describe("findProjectRoot", () => {
  it("finds project root with .git directory within cwd boundary", () => {
    withProjectRootFixture((root) => {
      mkdirSync(join(root, ".git"), { recursive: true });
      const nestedFile = createFile(root, "src/components/Button.tsx", "code");

      assert.equal(findProjectRoot(nestedFile, root), root);
    });
  });

  it("finds project root with package.json within cwd boundary", () => {
    withProjectRootFixture((root) => {
      writeFixtureFile(join(root, "package.json"), "{}\n");
      const nestedFile = createFile(root, "lib/index.js", "code");

      assert.equal(findProjectRoot(nestedFile, root), root);
    });
  });

  it("does not search above canonical cwd boundary", () => {
    withProjectRootFixture((root) => {
      const boundary = join(root, "workspace");
      mkdirSync(boundary, { recursive: true });
      writeFixtureFile(join(root, "package.json"), "{}\n");
      const nestedFile = createFile(boundary, "src/file.ts", "code");

      assert.equal(findProjectRoot(nestedFile, boundary), boundary);
    });
  });

  it("uses cwd boundary as project root when no marker exists inside boundary", () => {
    withProjectRootFixture((root) => {
      const nestedFile = createFile(root, "isolated/file.txt", "content");

      assert.equal(findProjectRoot(nestedFile, root), root);
    });
  });

  it("returns undefined when start path is outside cwd boundary", () => {
    withProjectRootFixture((root) => {
      const boundary = join(root, "workspace");
      const outside = join(root, "outside", "file.ts");
      mkdirSync(boundary, { recursive: true });
      writeFixtureFile(outside, "code");

      assert.equal(findProjectRoot(outside, boundary), undefined);
    });
  });
});

function withProjectRootFixture(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "rules-project-root-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function createFile(root: string, relativePath: string, content: string): string {
  const path = join(root, relativePath);
  writeFixtureFile(path, content);
  return path;
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}
