# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-27  
**Commit:** b817c33  
**Branch:** tier-1-hook-migration

## OVERVIEW

Hook Pack is a private Node 20+ TypeScript ESM Claude Code plugin for native hook automation. Runtime path: Claude Code hook event -> `hooks/hooks.json` -> `hooks/dispatch.sh` -> built dispatcher -> typed core registry -> built-in hook handlers.

## STRUCTURE

```
hook-pack/
├── .claude-plugin/plugin.json    # plugin metadata + userConfig schema
├── hooks/                        # shipped Claude Code hook registrations + wrapper
├── src/cli/dispatch.ts           # stdin JSON entrypoint
├── src/core/                     # events/config/registry/dispatcher/output contracts
├── src/hooks/                    # default-enabled governed hook implementations
├── tests/                        # source tests; compiled to dist/tests before run
├── docs/architecture/            # migration governance + verification evidence
├── docs/reference/               # ignored historical hook corpus, not runtime API
└── dist/                         # generated build output; never edit by hand
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Plugin manifest/user options | `.claude-plugin/plugin.json` | `name` must stay `hook-pack`; version strict `x.y.z`. |
| Native event registration | `hooks/hooks.json` | Keep JSON thin; one command hook per governed event. |
| Shell handoff | `hooks/dispatch.sh` | Requires `${CLAUDE_PLUGIN_ROOT}` and event name arg. |
| CLI input/output | `src/cli/dispatch.ts` | Reads stdin, writes Claude hook JSON only. |
| Event envelope | `src/core/events.ts` | Supported event set + `HookEnvelope` normalization. |
| Config precedence | `src/core/config.ts` | defaults -> plugin env -> `.claude/hook-pack.local.md`; disabled wins. |
| Registry gate | `src/core/registry.ts` | `BUILT_IN_REGISTRY`; lower-kebab IDs; timeout validation. |
| Output semantics | `src/core/output.ts` | Permission/block/context merge rules. |
| Handler map | `src/hooks/index.ts` | Registry handler IDs must match this map. |
| Migration rules | `docs/architecture/migration-governance.md` | Required before registry additions. |
| Full verification | `package.json` scripts | Build/typecheck/test/validate plugin. |

## CODE MAP

| Symbol | Type | Location | Role |
| --- | --- | --- | --- |
| `normalizeHookInput` | function | `src/core/events.ts` | Raw Claude stdin -> typed `HookEnvelope`. |
| `loadConfig` | function | `src/core/config.ts` | Merge runtime enablement and context settings. |
| `resolveRuntimeContext` | function | `src/core/runtime-context.ts` | Captures cwd, env, plugin data dir, user config. |
| `BUILT_IN_REGISTRY` | constant | `src/core/registry.ts` | Only built-in runtime entry list. |
| `dispatchHookEvent` | function | `src/core/dispatcher.ts` | Validate/select hooks; run selected entries in parallel. |
| `executeRegistryEntry` | function | `src/core/entry-runner.ts` | Run internal handlers or command specs. |
| `combineHookResults` | function | `src/core/output.ts` | Converts hook results into Claude hook output. |
| `BUILT_IN_HOOK_HANDLERS` | constant | `src/hooks/index.ts` | Stable handler ID -> factory instance map. |

## CONVENTIONS

- TypeScript uses `module: NodeNext`, ESM imports with explicit `.js`, `node:` builtin imports, and strict options including `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`.
- Runtime state, caches, downloads, generated state: `${CLAUDE_PLUGIN_DATA}` only.
- Shipped plugin files and scripts: `${CLAUDE_PLUGIN_ROOT}` only; no maintainer-machine paths.
- Project-local config lives in target project cwd at `.claude/hook-pack.local.md`; `.claude/*.local.*` is ignored.
- Hook IDs use lower-kebab-case and stay stable once released.
- Stateful hooks register lifecycle cleanup on `PreCompact` and `SessionEnd`, then also do opportunistic stale cleanup.
- Context hooks use `additionalContext`; do not mutate tool output.
- Tests use `node:test` + `node:assert/strict`; no Jest/Vitest config exists.

## ANTI-PATTERNS (THIS PROJECT)

- Do not edit `dist/**`, `node_modules/**`, or `package-lock.json` by hand. Change source/config/scripts, then rebuild.
- Do not copy OpenCode/Omo/Sisyphus identifiers or private coordinator assumptions from `docs/reference/**` into shipped source.
- Do not add runtime hook behavior without a portable Migration Feasibility Record and focused tests.
- Do not put runtime state in source dirs, `dist`, `hooks`, or `docs`.
- Do not store secrets in docs, tests, snapshots, local config, or generated state.
- Do not claim full live Claude Code runtime verification unless current evidence docs prove it.

## COMMANDS

```bash
npm install
npm run build
npm run typecheck
npm test
npm run validate:plugin
```

## NOTES

- `npm test` runs `npm run build` first, then `node --test "dist/tests/**/*.test.js"`.
- `npm run validate:plugin` builds first, then checks manifest JSON, hooks wrapper format, `hooks/dispatch.sh` executable bit, bundled `dist/hook-pack-dispatch.mjs`, generated `dist/src/core/registry.js`, and governance records.
- Claude Code docs currently list more hook events than Hook Pack registers. Hook Pack uses a governed subset; expand only through architecture docs, registry changes, tests, and validation.
