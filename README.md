# Hook Pack

Hook Pack is a Claude Code plugin foundation for native hook automation. The foundation includes the plugin scaffold, dispatcher, config loader, registry selection, validation, and docs, but no built-in hook behavior yet.

The runtime registry is empty during the foundation phase. `BUILT_IN_REGISTRY` contains no hook IDs, so no policy hook runs until a later migration adds a governed registry entry.

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

Hook Pack reads Claude Code plugin options and project-local settings. Plugin options use these fields:

| Option | Meaning |
| --- | --- |
| `enabled_hooks` | Comma-separated hook IDs to enable when those IDs exist in the runtime registry. |
| `disabled_hooks` | Comma-separated hook IDs to disable. Disabled IDs always win. |
| `enable_all_hooks_by_default` | Enables every implemented hook by default unless disabled. |

Project-local settings live in `.claude/hook-pack.local.md`. Keep this file local to your project. The repository `.gitignore` excludes `.claude/*.local.md` and `.claude/*.local.json`.

Example:

```markdown
---
enabled: true
enable_all_hooks_by_default: false
enabled_hooks: []
disabled_hooks: []
---

# Hook Pack local notes

Use this space for project notes about hook choices. Do not put secrets here.
```

Do not place API keys, tokens, credentials, private URLs, or other secrets in local config. Hook Pack config controls hook selection only.

## State and data

Runtime state must be stored outside the plugin source tree. Use `${CLAUDE_PLUGIN_DATA}` for plugin-owned state when a future hook needs cache files, migration records, or generated runtime data. Source files, docs, and registry code stay immutable at runtime.

## Foundation phase status

Current foundation includes:

1. Claude Code plugin manifest and hook event registrations.
2. Dispatcher wrapper and TypeScript CLI entry point.
3. Config loading from plugin options and `.claude/hook-pack.local.md`.
4. Registry validation and selection logic.
5. Empty runtime registry with no shipped hook IDs.
6. Migration governance docs that must be completed before any hook enters `BUILT_IN_REGISTRY`.

See `docs/architecture/hook-pack-foundation.md` and `docs/architecture/migration-governance.md` before adding runtime hook behavior.
