import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { DEFAULT_CONFIG, loadConfig, mergeConfig, parseHookList, parseProjectLocalFrontmatter, readEnvironmentConfig, readProjectLocalConfig } from "../src/core/config.js";
function withTempConfigDir(run) {
    const cwd = mkdtempSync(join(tmpdir(), "hook-pack-config-"));
    try {
        run(cwd);
    }
    finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}
describe("hook-pack config", () => {
    it("exposes default config field names", () => {
        const expectedDefault = {
            enabled: true,
            enableAllHooksByDefault: false,
            enabledHooks: [],
            disabledHooks: []
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
        const base = {
            enabled: true,
            enableAllHooksByDefault: false,
            enabledHooks: ["alpha", "beta"],
            disabledHooks: ["omega"]
        };
        const override = {
            enabled: false,
            enableAllHooksByDefault: true,
            enabledHooks: ["beta", "project-only"],
            disabledHooks: ["beta", "delta"]
        };
        assert.deepEqual(mergeConfig(base, override), {
            enabled: false,
            enableAllHooksByDefault: true,
            enabledHooks: ["beta", "project-only"],
            disabledHooks: ["beta", "delta"]
        });
    });
    it("keeps base list fields when override omits them", () => {
        const base = {
            enabled: true,
            enableAllHooksByDefault: false,
            enabledHooks: ["alpha"],
            disabledHooks: ["omega"]
        };
        assert.deepEqual(mergeConfig(base, { enabled: false }), {
            enabled: false,
            enableAllHooksByDefault: false,
            enabledHooks: ["alpha"],
            disabledHooks: ["omega"]
        });
    });
    it("reads environment config from Claude plugin option names", () => {
        const environment = {
            CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS: "alpha, beta, alpha",
            CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS: "[gamma, beta]",
            CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT: "true"
        };
        assert.deepEqual(readEnvironmentConfig(environment), {
            enabledHooks: ["alpha", "beta"],
            disabledHooks: ["gamma", "beta"],
            enableAllHooksByDefault: true
        });
    });
    it("parses project-local YAML-ish frontmatter with array and comma hook forms", () => {
        const config = parseProjectLocalFrontmatter(`---
enabled: false
enable_all_hooks_by_default: true
enabled_hooks: [alpha, "beta", alpha]
disabled_hooks: gamma, beta, gamma
---

# Local notes
Do not put secrets here.
`);
        assert.deepEqual(config, {
            enabled: false,
            enableAllHooksByDefault: true,
            enabledHooks: ["alpha", "beta"],
            disabledHooks: ["gamma", "beta"]
        });
    });
    it("returns empty project-local config when frontmatter is absent", () => {
        assert.deepEqual(parseProjectLocalFrontmatter("# Hook Pack\n\nNo structured settings."), {});
    });
    it("reads .claude/hook-pack.local.md from cwd", () => {
        withTempConfigDir((cwd) => {
            mkdirSync(join(cwd, ".claude"));
            writeFileSync(join(cwd, ".claude", "hook-pack.local.md"), `---
enabled: true
enabled_hooks: alpha, beta
disabled_hooks: [beta, gamma]
---
`, "utf8");
            assert.deepEqual(readProjectLocalConfig(cwd), {
                enabled: true,
                enabledHooks: ["alpha", "beta"],
                disabledHooks: ["beta", "gamma"]
            });
        });
    });
    it("returns empty project-local config when local file is absent", () => {
        withTempConfigDir((cwd) => {
            assert.deepEqual(readProjectLocalConfig(cwd), {});
        });
    });
    it("loads config by merging defaults, environment, then project-local overrides", () => {
        const environment = {
            CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS: "alpha, beta, env-only",
            CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS: "env-disabled",
            CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT: "false"
        };
        withTempConfigDir((cwd) => {
            mkdirSync(join(cwd, ".claude"));
            writeFileSync(join(cwd, ".claude", "hook-pack.local.md"), `---
enabled: false
enable_all_hooks_by_default: true
enabled_hooks: project-only, beta
disabled_hooks: beta, project-disabled
---
`, "utf8");
            assert.deepEqual(loadConfig(cwd, environment), {
                enabled: false,
                enableAllHooksByDefault: true,
                enabledHooks: ["project-only", "beta"],
                disabledHooks: ["beta", "project-disabled"]
            });
        });
    });
});
