# Hook Pack

Hook Pack is a Claude Code plugin foundation for native hook automation. The foundation includes the plugin scaffold, dispatcher, config loader, registry selection, validation, and docs for governed built-in hook migration.

## Tier 1 governed hooks

Tier 1 migration governance records cover these planned built-in hook IDs. Each hook becomes active only when its registry entry lands and remains configurable through the fields below.

| Hook ID | Event mapping | Planned default | Purpose |
| --- | --- | --- | --- |
| `comment-checker` | `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd` | enabled after registry entry lands | Detects unnecessary comments after write/edit-style tools when a checker command or downloaded binary is available; findings block continuation so the agent fixes them. |
| `directory-agents-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | enabled after registry entry lands | Injects nested `AGENTS.md` context after successful `Read` results and clears dedupe on lifecycle cleanup. |
| `directory-readme-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | enabled after registry entry lands | Injects relevant `README.md` context after successful `Read` results and clears dedupe on lifecycle cleanup. |
| `rules-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | enabled after registry entry lands | Injects matching project rule files (`.github/instructions`, `.cursor/rules`, `.claude/rules`) after successful file read/write/edit tools and clears dedupe/cache on lifecycle cleanup. |
| `write-existing-file-guard` | `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd` | enabled after registry entry lands | Blocks unsafe `Write` overwrites until the file has been read successfully in the same session. |

### Plugin user configuration

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled_hooks` | comma-separated string | empty | Hook IDs to enable beyond defaults. |
| `disabled_hooks` | comma-separated string | empty | Hook IDs to disable; always wins. |
| `enable_all_hooks_by_default` | boolean | `false` | When `true`, enables every implemented registry hook unless disabled. |
| `max_context_chars` | number | `20000` | Fallback truncation limit when no model context window is detected. |
| `include_user_rules` | boolean | `false` | When `true`, scan `~/.claude/rules`, `~/.cursor/rules`, `~/.github/instructions` for project-wide rules. |

Disable one hook locally via `.claude/hook-pack.local.md`:

```markdown
---
enabled: true
disabled_hooks: write-existing-file-guard
---
```

`PreCompact` and `SessionEnd` cleanup remove per-session plugin-data state when those events fire so directory/rule context can be re-injected after compaction and stale read permissions do not survive known session boundaries. Each stateful hook also runs opportunistic stale-state cleanup during normal execution because `SessionEnd` is not guaranteed for every normal exit.

## Development commands

Run from the plugin root:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run validate:plugin
```

`npm test` builds TypeScript first, then runs the compiled Node test suite under `dist/tests/**/*.test.js`.

## Local Claude Code build and run

Build before testing the plugin locally:

```bash
npm run build
```

Claude Code loads plugin hooks from `hooks/hooks.json`. Each registered native event calls the wrapper script:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh" PreToolUse
```

For a local run, install or enable this directory as a Claude Code plugin, restart Claude Code so hooks are loaded, then use `/hooks` or debug mode to inspect registrations. The wrapper requires `${CLAUDE_PLUGIN_ROOT}` so installed plugin paths stay portable across machines.

## User configuration

Hook Pack reads Claude Code plugin options and project-local settings. Project-local settings live in `.claude/hook-pack.local.md`. Keep this file local to your project. The repository `.gitignore` excludes `.claude/*.local.md` and `.claude/*.local.json`.

Do not place API keys, tokens, credentials, private URLs, or other secrets in local config. Hook Pack config controls hook selection only.

## State and data

Runtime state must be stored outside the plugin source tree. Use `${CLAUDE_PLUGIN_DATA}` for plugin-owned state when a hook needs cache files, migration records, or generated runtime data. Source files, docs, and registry code stay immutable at runtime.

## Migration governance status

Built-in hooks enter the runtime only after migration feasibility records document native Claude Code event mapping, state rules, lifecycle cleanup, failure behavior, tests, and orchestration neutrality.

See `docs/architecture/hook-pack-foundation.md` and `docs/architecture/migration-governance.md` before adding runtime hook behavior.
