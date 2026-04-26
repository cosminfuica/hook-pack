# src/hooks/ — Built-In Hook Implementations

## OVERVIEW

This directory contains default-enabled governed hook handlers plus shared helpers. Hooks are selected by `src/core/registry.ts` and resolved through `src/hooks/index.ts`.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Handler map | `index.ts` | Stable handler ID -> handler factory instance. |
| Handler type | `types.ts` | `BuiltInHookHandler(envelope, context)`. |
| Comment policy | `comment-checker/` | Pending write/edit checks, checker binary, downloader, runner. |
| Directory context | `directory-agents-injector/`, `directory-readme-injector/` | `Read`-triggered context injection. |
| Rule context | `rules-injector/` | Project/user rule discovery and dedupe. |
| Write safety | `write-existing-file-guard/` | Same-session read token before unsafe `Write`. |
| Shared helpers | `shared/` | Path, state, lifecycle, context, rule, truncation, lock utilities. |

## CONVENTIONS

- Hook factories return `BuiltInHookHandler`; handlers receive typed envelope and `HookRuntimeContext`.
- Return `{ hookId }` when event/tool/input is not applicable.
- Use `additionalContext` for injected guidance; never mutate tool output.
- Put state, downloads, locks, caches, and dedupe files under `${CLAUDE_PLUGIN_DATA}`.
- Canonicalize paths before cwd-boundary checks; accept `file_path`, `filePath`, and `path` aliases where tool inputs require it.
- Stateful hooks must handle `PreCompact` and `SessionEnd`, then opportunistically clean stale state because `SessionEnd` is not guaranteed.
- Prefer shared helpers over new bespoke filesystem, lock, truncation, or response-success logic.

## HOOK-SPECIFIC TRAPS

- `comment-checker`: checker unavailable paths fail open; checker findings block; `apply_patch` parity is intentionally dropped until Claude runtime metadata exists.
- `directory-agents-injector`: include root `AGENTS.md`; current verification did not prove Claude Code auto-loads root context.
- `rules-injector`: user-home rules require `includeUserRules`; project scans stay inside canonical cwd/project root.
- `write-existing-file-guard`: existing in-cwd writes fail closed without a valid read token; plugin-data paths are allowed.

## ANTI-PATTERNS

- Do not parse plugin config or raw stdin inside hook implementations.
- Do not copy reference hook OpenCode event names or private state models into shipped code.
- Do not add a hook directory without registry entry, handler map entry, tests, and migration governance.
- Do not store raw sensitive tool payloads in plugin-data state.
