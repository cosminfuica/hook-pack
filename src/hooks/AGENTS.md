# src/hooks/ — Built-In Hook Implementations

## OVERVIEW

Default-enabled governed hook handlers plus shared helpers. Hooks are selected by `src/core/registry.ts` and resolved through `src/hooks/index.ts`.

## WHERE TO LOOK

| Task              | Location                                                   | Notes                                                              |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Handler map       | `index.ts`                                                 | Stable handler ID -> handler factory instance.                     |
| Handler type      | `types.ts`                                                 | `BuiltInHookHandler(envelope, context)`.                           |
| Comment policy    | `comment-checker/`                                         | Pending write/edit checks, checker binary download/cache, runner.  |
| Directory context | `directory-agents-injector/`, `directory-readme-injector/` | `Read`-triggered context injection.                                |
| Rule context      | `rules-injector/`                                          | Project/user rule discovery, parsed cache, session dedupe.         |
| Write safety      | `write-existing-file-guard/`                               | Same-session read token before unsafe `Write`.                     |
| Shared helpers    | `shared/`                                                  | Path, state, lifecycle, context, rule, truncation, lock utilities. |

## CONVENTIONS

- Hook factories return `BuiltInHookHandler`; handlers receive typed `HookEnvelope` and `HookRuntimeContext`.
- Return `{ hookId }` when event/tool/input is not applicable.
- Use `additionalContext` for injected guidance; never mutate tool output.
- Put state, downloads, locks, caches, and dedupe files under `${CLAUDE_PLUGIN_DATA}`.
- Canonicalize paths before cwd/plugin-data boundary checks; accept `file_path`, `filePath`, and `path` aliases via shared helpers.
- Stateful hooks handle `PreCompact` and `SessionEnd`, then opportunistically clean stale state because `SessionEnd` is not guaranteed.
- Prefer `shared/` helpers over bespoke filesystem, lock, truncation, path, rule, or response-success logic.

## HOOK-SPECIFIC TRAPS

- `comment-checker`: checker unavailable/timeout/state-read paths fail open; checker findings block; apply-patch parity is intentionally dropped until Claude runtime metadata exists.
- `directory-agents-injector`: includes root `AGENTS.md`; README injector excludes root README; both use shared directory traversal state.
- `rules-injector`: user-home rules require `includeUserRules`; project scans stay inside canonical cwd/project root and dedupe by realpath/content hash.
- `write-existing-file-guard`: existing in-cwd writes fail closed without valid read token; `overwrite: true` strips overwrite and invalidates tokens; plugin-data paths are allowed.

## ANTI-PATTERNS

- Do not parse plugin config or raw stdin inside hook implementations.
- Do not copy OpenCode event names, private state models, or storage paths into shipped code.
- Do not add a hook directory without registry entry, handler map entry, docs/config update, and focused tests.
- Do not store raw sensitive tool payloads in plugin-data state.

## VERIFICATION

- Hook changes need targeted `tests/hooks/*.test.ts` after build plus `npm run typecheck`.
- Shared-helper or output-contract changes normally need full `npm test`.
