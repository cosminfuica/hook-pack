import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_CONFIG,
  loadConfig,
  mergeConfig,
  parseHookList,
  parseProjectLocalFrontmatter,
  readEnvironmentConfig,
  readProjectLocalConfig,
  type ConfigEnvironment,
  type HookPackConfig,
  type PartialHookPackConfig
} from "../src/core/config.js";

function withTempConfigDir(run: (cwd: string) => void): void {
  const cwd = mkdtempSync(join(tmpdir(), "hook-pack-config-"));
  try {
    run(cwd);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("hook-pack config", () => {
  it("exposes default config field names", () => {
    const expectedDefault: HookPackConfig = {
      enabled: true,
      enableAllHooksByDefault: false,
      enabledHooks: [],
      disabledHooks: [],
      maxContextChars: 20_000,
      includeUserRules: false
    };

    assert.deepEqual(DEFAULT_CONFIG, expectedDefault);
  });

  it("parses comma and bracket hook lists with quotes and first-seen dedupe", () => {
    assert.deepEqual(parseHookList(undefined), []);
    assert.deepEqual(parseHookList(""), []);
    assert.deepEqual(parseHookList("alpha, beta,, alpha ,gamma, beta"), ["alpha", "beta", "gamma"]);
    assert.deepEqual(parseHookList("[alpha, 'beta', \"gamma\", alpha]"), ["alpha", "beta", "gamma"]);
  });

  it("merges one override by replacing provided list fields without disabled filtering", () => {
    const base: HookPackConfig = {
      enabled: true,
      enableAllHooksByDefault: false,
      enabledHooks: ["alpha", "beta"],
      disabledHooks: ["omega"],
      maxContextChars: 20_000,
      includeUserRules: false
    };
    const override: PartialHookPackConfig = {
      enabled: false,
      enableAllHooksByDefault: true,
      enabledHooks: ["beta", "project-only"],
      disabledHooks: ["beta", "delta"],
      maxContextChars: 50_000,
      includeUserRules: true
    };

    assert.deepEqual(mergeConfig(base, override), {
      enabled: false,
      enableAllHooksByDefault: true,
      enabledHooks: ["beta", "project-only"],
      disabledHooks: ["beta", "delta"],
      maxContextChars: 50_000,
      includeUserRules: true
    });
  });

  it("keeps base list and userConfig fields when override omits them", () => {
    const base: HookPackConfig = {
      enabled: true,
      enableAllHooksByDefault: false,
      enabledHooks: ["alpha"],
      disabledHooks: ["omega"],
      maxContextChars: 25_000,
      includeUserRules: true
    };

    assert.deepEqual(mergeConfig(base, { enabled: false }), {
      enabled: false,
      enableAllHooksByDefault: false,
      enabledHooks: ["alpha"],
      disabledHooks: ["omega"],
      maxContextChars: 25_000,
      includeUserRules: true
    });
  });

  it("reads environment config from Claude plugin option names", () => {
    const environment: ConfigEnvironment = {
      CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS: "alpha, beta, alpha",
      CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS: "[gamma, beta]",
      CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT: "true",
      CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS: "50000",
      CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES: "true"
    };

    assert.deepEqual(readEnvironmentConfig(environment), {
      enabledHooks: ["alpha", "beta"],
      disabledHooks: ["gamma", "beta"],
      enableAllHooksByDefault: true,
      maxContextChars: 50_000,
      includeUserRules: true
    });
  });

  it("omits invalid max_context_chars environment values so defaults win", () => {
    const invalidValues = ["", "abc", "-1", "0", "1.5"];

    for (const value of invalidValues) {
      assert.deepEqual(
        readEnvironmentConfig({ CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS: value }),
        {},
        `${value} should be omitted`
      );
    }

    assert.equal(
      mergeConfig(DEFAULT_CONFIG, readEnvironmentConfig({ CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS: "abc" }))
        .maxContextChars,
      20_000
    );
  });

  it("omits invalid include_user_rules environment values", () => {
    assert.deepEqual(readEnvironmentConfig({ CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES: "yes" }), {});
    assert.deepEqual(readEnvironmentConfig({ CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES: "false" }), {
      includeUserRules: false
    });
  });

  it("parses project-local YAML-ish frontmatter with array and comma hook forms", () => {
    const config = parseProjectLocalFrontmatter(`---
enabled: false
enable_all_hooks_by_default: true
enabled_hooks: [alpha, "beta", alpha]
disabled_hooks: gamma, beta, gamma
max_context_chars: 45000
include_user_rules: true
---

# Local notes
Do not put secrets here.
`);

    assert.deepEqual(config, {
      enabled: false,
      enableAllHooksByDefault: true,
      enabledHooks: ["alpha", "beta"],
      disabledHooks: ["gamma", "beta"],
      maxContextChars: 45_000,
      includeUserRules: true
    });
  });

  it("omits invalid max_context_chars frontmatter values so defaults win", () => {
    const invalidValues = ["", "abc", "-1", "0", "1.5"];

    for (const value of invalidValues) {
      assert.deepEqual(
        parseProjectLocalFrontmatter(`---\nmax_context_chars: ${value}\n---\n`),
        {},
        `${value} should be omitted`
      );
    }

    assert.equal(
      mergeConfig(DEFAULT_CONFIG, parseProjectLocalFrontmatter(`---\nmax_context_chars: 0\n---\n`)).maxContextChars,
      20_000
    );
  });

  it("returns empty project-local config when frontmatter is absent", () => {
    assert.deepEqual(parseProjectLocalFrontmatter("# Hook Pack\n\nNo structured settings."), {});
  });

  it("reads .claude/hook-pack.local.md from cwd", () => {
    withTempConfigDir((cwd) => {
      mkdirSync(join(cwd, ".claude"));
      writeFileSync(
        join(cwd, ".claude", "hook-pack.local.md"),
        `---
enabled: true
enabled_hooks: alpha, beta
disabled_hooks: [beta, gamma]
include_user_rules: false
---
`,
        "utf8"
      );

      assert.deepEqual(readProjectLocalConfig(cwd), {
        enabled: true,
        enabledHooks: ["alpha", "beta"],
        disabledHooks: ["beta", "gamma"],
        includeUserRules: false
      });
    });
  });

  it("returns empty project-local config when local file is absent", () => {
    withTempConfigDir((cwd) => {
      assert.deepEqual(readProjectLocalConfig(cwd), {});
    });
  });

  it("loads config by merging defaults, environment, then project-local overrides", () => {
    const environment: ConfigEnvironment = {
      CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS: "alpha, beta, env-only",
      CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS: "env-disabled",
      CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT: "false",
      CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS: "50000",
      CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES: "true"
    };

    withTempConfigDir((cwd) => {
      mkdirSync(join(cwd, ".claude"));
      writeFileSync(
        join(cwd, ".claude", "hook-pack.local.md"),
        `---
enabled: false
enable_all_hooks_by_default: true
enabled_hooks: project-only, beta
disabled_hooks: beta, project-disabled
max_context_chars: 30000
include_user_rules: false
---
`,
        "utf8"
      );

      assert.deepEqual(loadConfig(cwd, environment), {
        enabled: false,
        enableAllHooksByDefault: true,
        enabledHooks: ["project-only", "beta"],
        disabledHooks: ["beta", "project-disabled"],
        maxContextChars: 30_000,
        includeUserRules: false
      });
    });
  });
});
