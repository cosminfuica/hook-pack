# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-27  
**Commit:** 1f4df96  
**Branch:** main

## OVERVIEW

Hook Pack is a private Node 20+ TypeScript ESM Claude Code plugin for native hook automation. Runtime path: Claude Code hook event -> `hooks/hooks.json` -> `hooks/dispatch.sh` -> bundled dispatcher -> typed core registry -> built-in hook handlers.

## STRUCTURE

```
hook-pack/
├── .claude-plugin/              # plugin manifest + marketplace metadata
├── hooks/                       # shipped Claude Code hook registrations + wrapper
├── src/cli/dispatch.ts          # stdin JSON entrypoint; stdout hook JSON only
├── src/core/                    # events/config/runtime/registry/dispatcher/output contracts
├── src/hooks/                   # default-enabled governed hook implementations
├── tests/                       # TS tests; compiled to dist/tests before execution
├── scripts/                     # esbuild bundle + plugin validator utilities
├── docs/configuration.md        # user-facing hook/config reference
└── dist/hook-pack-dispatch.mjs  # generated bundled runtime artifact; rebuild, never hand-edit
```

## WHERE TO LOOK

| Task                         | Location                          | Notes                                                                                   |
| ---------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| Plugin manifest/user options | `.claude-plugin/plugin.json`      | `name` must stay `hook-pack`; version strict `x.y.z`; `userConfig` required.            |
| Marketplace metadata         | `.claude-plugin/marketplace.json` | Lists `cosminfuica/hook-pack`; keep hook list synced with shipped defaults.             |
| Native event registration    | `hooks/hooks.json`                | Plugin wrapper shape; one command hook per governed event; timeout `10`.                |
| Shell handoff                | `hooks/dispatch.sh`               | Requires event arg and `${CLAUDE_PLUGIN_ROOT}`; bundle first, compiled fallback second. |
| CLI input/output             | `src/cli/dispatch.ts`             | Reads stdin, loads config/context, writes Claude hook JSON only when non-empty.         |
| Event envelope               | `src/core/events.ts`              | `SUPPORTED_EVENTS`, `REGISTERED_DISPATCH_EVENTS`, `HookEnvelope` normalization.         |
| Config precedence            | `src/core/config.ts`              | defaults -> plugin env -> `.claude/hook-pack.local.md`; disabled wins.                  |
| Registry gate                | `src/core/registry.ts`            | `BUILT_IN_REGISTRY`; stable lower-kebab IDs; timeout validation.                        |
| Output semantics             | `src/core/output.ts`              | Deterministic permission/block/context merge rules.                                     |
| Handler map                  | `src/hooks/index.ts`              | Registry handler IDs must match map keys.                                               |
| Shared hook utilities        | `src/hooks/shared/`               | Path, state, lifecycle, context, rule, truncation, lock helpers.                        |
| Runtime bundle/validator     | `scripts/`                        | esbuild runtime bundle and plugin structure checks.                                     |
| Full verification            | `package.json` scripts            | Build/typecheck/test/validate plugin.                                                   |

## CODE MAP

| Symbol                   | Type     | Location                          | Role                                                                      |
| ------------------------ | -------- | --------------------------------- | ------------------------------------------------------------------------- |
| `normalizeHookInput`     | function | `src/core/events.ts`              | Raw Claude stdin + argv event -> typed `HookEnvelope`.                    |
| `loadConfig`             | function | `src/core/config.ts`              | Merge default, plugin env, and project-local config.                      |
| `resolveRuntimeContext`  | function | `src/core/runtime-context.ts`     | Captures cwd, env, plugin-data dir, debug flag, user config, clock.       |
| `BUILT_IN_REGISTRY`      | constant | `src/core/registry.ts`            | Authoritative built-in runtime entry list.                                |
| `dispatchHookEvent`      | function | `src/core/dispatcher.ts`          | Validate/select hooks; run selected entries concurrently; fail safely.    |
| `executeRegistryEntry`   | function | `src/core/entry-runner.ts`        | Run internal handlers or command specs; normalize command JSON output.    |
| `combineHookResults`     | function | `src/core/output.ts`              | Convert hook results into Claude hook output with deterministic priority. |
| `BUILT_IN_HOOK_HANDLERS` | constant | `src/hooks/index.ts`              | Stable handler ID -> hook factory map.                                    |
| `createJsonStateStore`   | function | `src/hooks/shared/state-store.ts` | Versioned per-session JSON state under `${CLAUDE_PLUGIN_DATA}`.           |

## CONVENTIONS

- TypeScript uses `module: NodeNext`, `moduleResolution: NodeNext`, explicit `.js` relative imports, `node:` builtins, and strict flags including `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`.
- Package is single-root npm ESM, not a monorepo; `package-lock.json` is npm-managed.
- Runtime state, caches, downloads, locks, and generated state: `${CLAUDE_PLUGIN_DATA}` only. Never write them into source, `dist`, `hooks`, `docs`, `$HOME`, or `/tmp`.
- Shipped plugin files/scripts use `${CLAUDE_PLUGIN_ROOT}` only; hook commands run from Claude's current cwd, not from plugin root.
- Project-local config lives in target project cwd at `.claude/hook-pack.local.md`; `.claude/*.local.*` is ignored and must not contain secrets.
- Hook IDs use stable lower-kebab-case and match `src/hooks/index.ts` handler keys.
- Stateful hooks handle `PreCompact` and `SessionEnd`, then also do opportunistic stale cleanup because `SessionEnd` is not guaranteed.
- Context hooks use `additionalContext`; do not mutate tool output.
- Tests use `node:test` + `node:assert/strict`; run compiled JS under `dist/tests`, not TS files directly.

## ANTI-PATTERNS (THIS PROJECT)

- Do not edit `dist/**`, `node_modules/**`, or `package-lock.json` by hand. Change source/config/scripts, then rebuild.
- Do not add runtime hook behavior without focused tests, docs/config updates, registry/handler-map updates, and explicit portability review.
- Do not put hook selection, config parsing, path checks, or output policy in `hooks/hooks.json`; central dispatcher owns policy.
- Do not store secrets in docs, tests, snapshots, local config, or generated state.
- Do not claim live Claude Code runtime verification unless current evidence proves an actual Claude Code plugin run.
- Do not assume `docs/architecture/**` exists or that `validate:plugin` enforces governance records; current tree has no `docs/architecture` directory.

## COMMANDS

```bash
npm install
npm run build
npm run typecheck
npm test
npm run validate:plugin
```

## NOTES

- `npm run build` = `tsc -p tsconfig.json && node scripts/bundle-runtime.mjs`; bundle entry is `dist/src/cli/dispatch.js`, output is `dist/hook-pack-dispatch.mjs`.
- `npm test` runs `npm run build` first, then `node --test "dist/tests/**/*.test.js"`; Node runs matching JS test files as separate child processes.
- `npm run validate:plugin` builds first, then checks manifest name/version/userConfig, hooks wrapper format, quoted dispatch command substring, timeout `10`, `hooks/dispatch.sh` executable bit, bundled dispatcher, and generated registry artifact IDs.
- `dist/hook-pack-dispatch.mjs` is generated but install-critical; after runtime source changes, rebuild and commit that artifact.
- Claude Code docs currently support more hook events and handler types than Hook Pack registers. Hook Pack intentionally ships a governed command-hook subset; event input schema may grow, so normalization should tolerate unknown fields.
