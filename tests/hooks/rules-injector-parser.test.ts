// Ported from: docs/reference/hooks/rules-injector/parser.test.ts
// Adaptations:
// - bun:test → node:test/node:assert/strict
// - Task 6 matcher parity cases added for picomatch glob patterns from rules-injector matcher port

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseRuleFrontmatter } from "../../src/hooks/shared/frontmatter.js";
import { shouldApplyRule } from "../../src/hooks/shared/rule-discovery-matcher.js";

describe("parseRuleFrontmatter", () => {
  describe("applyTo field (GitHub Copilot format)", () => {
    it("should parse applyTo as single string", () => {
      // given frontmatter with applyTo as single string
      const content = `---
applyTo: "*.ts"
---
Rule content here`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then globs should contain the pattern
      assert.equal(result.metadata.globs, "*.ts");
      assert.equal(result.body, "Rule content here");
    });

    it("should parse applyTo as inline array", () => {
      // given frontmatter with applyTo as inline array
      const content = `---
applyTo: ["*.ts", "*.tsx"]
---
Rule content`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then globs should be array
      assert.deepEqual(result.metadata.globs, ["*.ts", "*.tsx"]);
    });

    it("should parse applyTo as multi-line array", () => {
      // given frontmatter with applyTo as multi-line array
      const content = `---
applyTo:
  - "*.ts"
  - "src/**/*.js"
---
Content`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then globs should be array
      assert.deepEqual(result.metadata.globs, ["*.ts", "src/**/*.js"]);
    });

    it("should parse applyTo as comma-separated string", () => {
      // given frontmatter with comma-separated applyTo
      const content = `---
applyTo: "*.ts, *.js"
---
Content`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then globs should be array
      assert.deepEqual(result.metadata.globs, ["*.ts", "*.js"]);
    });

    it("should merge applyTo and globs when both present", () => {
      // given frontmatter with both applyTo and globs
      const content = `---
globs: "*.md"
applyTo: "*.ts"
---
Content`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should merge both into globs array
      assert.deepEqual(result.metadata.globs, ["*.md", "*.ts"]);
    });

    it("should parse applyTo without quotes", () => {
      // given frontmatter with unquoted applyTo
      const content = `---
applyTo: **/*.py
---
Python rules`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should parse correctly
      assert.equal(result.metadata.globs, "**/*.py");
    });

    it("should parse applyTo with description", () => {
      // given frontmatter with applyTo and description (GitHub Copilot style)
      const content = `---
applyTo: "**/*.ts,**/*.tsx"
description: "TypeScript coding standards"
---
# TypeScript Guidelines`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should parse both fields
      assert.deepEqual(result.metadata.globs, ["**/*.ts", "**/*.tsx"]);
      assert.equal(result.metadata.description, "TypeScript coding standards");
    });
  });

  describe("existing globs/paths parsing (backward compatibility)", () => {
    it("should still parse globs field correctly", () => {
      // given existing globs format
      const content = `---
globs: ["*.py", "**/*.ts"]
---
Python/TypeScript rules`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should work as before
      assert.deepEqual(result.metadata.globs, ["*.py", "**/*.ts"]);
    });

    it("should still parse paths field as alias", () => {
      // given paths field (Claude Code style)
      const content = `---
paths: ["src/**"]
---
Source rules`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should map to globs
      assert.deepEqual(result.metadata.globs, ["src/**"]);
    });

    it("should parse alwaysApply correctly", () => {
      // given frontmatter with alwaysApply
      const content = `---
alwaysApply: true
---
Always apply this rule`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should recognize alwaysApply
      assert.equal(result.metadata.alwaysApply, true);
    });
  });

  describe("no frontmatter", () => {
    it("should return empty metadata and full body for plain markdown", () => {
      // given markdown without frontmatter
      const content = `# Instructions
This is a plain rule file without frontmatter.`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should have empty metadata
      assert.deepEqual(result.metadata, {});
      assert.equal(result.body, content);
    });

    it("should handle empty content", () => {
      // given empty content
      const content = "";

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should return empty metadata and body
      assert.deepEqual(result.metadata, {});
      assert.equal(result.body, "");
    });
  });

  describe("edge cases", () => {
    it("should handle frontmatter with only applyTo", () => {
      // given minimal GitHub Copilot format
      const content = `---
applyTo: "**"
---
Apply to all files`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should parse correctly
      assert.equal(result.metadata.globs, "**");
      assert.equal(result.body, "Apply to all files");
    });

    it("should handle mixed array formats", () => {
      // given globs as multi-line and applyTo as inline
      const content = `---
globs:
  - "*.md"
applyTo: ["*.ts", "*.js"]
---
Mixed format`;

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should merge both
      assert.deepEqual(result.metadata.globs, ["*.md", "*.ts", "*.js"]);
    });

    it("should handle Windows-style line endings", () => {
      // given content with CRLF
      const content = "---\r\napplyTo: \"*.ts\"\r\n---\r\nWindows content";

      // when parsing
      const result = parseRuleFrontmatter(content);

      // then should parse correctly
      assert.equal(result.metadata.globs, "*.ts");
      assert.equal(result.body, "Windows content");
    });
  });
});

describe("rules-injector picomatch matcher", () => {
  const projectRoot = "/workspace";

  it("matches required Task 6 reference glob patterns", () => {
    const cases = [
      { pattern: "src/**/*.ts", matchingPath: "/workspace/src/feature/a.ts", nonMatchingPath: "/workspace/src/feature/a.js" },
      { pattern: "src/**/*.{ts,tsx}", matchingPath: "/workspace/src/feature/view.tsx", nonMatchingPath: "/workspace/src/feature/view.jsx" },
      { pattern: "**/*.md", matchingPath: "/workspace/docs/guide.md", nonMatchingPath: "/workspace/docs/guide.txt" },
      { pattern: "docs/?-guide.md", matchingPath: "/workspace/docs/a-guide.md", nonMatchingPath: "/workspace/docs/ab-guide.md" },
      { pattern: "docs/{a,b}/*.md", matchingPath: "/workspace/docs/a/guide.md", nonMatchingPath: "/workspace/docs/c/guide.md" }
    ];

    for (const { pattern, matchingPath, nonMatchingPath } of cases) {
      assert.deepEqual(shouldApplyRule({ globs: pattern }, matchingPath, projectRoot), {
        applies: true,
        reason: `glob: ${pattern}`
      });
      assert.deepEqual(shouldApplyRule({ globs: pattern }, nonMatchingPath, projectRoot), { applies: false });
    }
  });
});
