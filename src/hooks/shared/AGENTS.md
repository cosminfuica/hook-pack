# src/hooks/shared/ — Hook Utility Contracts

## OVERVIEW

Reusable infrastructure for built-in hooks. Shared owns path safety, state/lock storage, lifecycle cleanup, context formatting, rule discovery, truncation, and tool-output helpers.

## WHERE TO LOOK

| Task              | Location                                                           | Notes                                                                            |
| ----------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Path handling     | `path.ts`                                                          | `file_path`/`filePath`/`path` extraction, canonicalization, cwd-boundary checks. |
| Tool responses    | `tool-output.ts`                                                   | PostToolUse success heuristic and path extraction from input/metadata.           |
| JSON state        | `state-store.ts`                                                   | Versioned per-session JSON, base64url keys, temp+rename writes, locks.           |
| Locks             | `file-lock.ts`, `state-store.ts`                                   | Directory locks, owner tokens, stale lock cleanup.                               |
| Lifecycle cleanup | `lifecycle-state.ts`                                               | Deletes nested dir and `.json` session state.                                    |
| Context blocks    | `context-block.ts`, `directory-context.ts`, `dynamic-truncator.ts` | Deterministic formatting, directory traversal, truncation notices.               |
| Rule discovery    | `frontmatter.ts`, `rule-discovery*.ts`                             | Project/user rule scanning, matching, caching, dedupe.                           |

## CONVENTIONS

- Shared helpers must not decide registry membership, hook enablement, or CLI behavior.
- State paths live under `context.pluginDataDir`; never use raw session IDs as path segments. Use `encodeSessionStateKey`, content hashes, or realpath-derived safe keys.
- Treat corrupt or version-mismatched JSON state as absent unless caller has explicit fail-closed security semantics.
- Canonicalize existing paths or parents before cwd/plugin-data boundary checks.
- Keep `extractToolPath` alias priority stable: `file_path`, then `filePath`, then `path`.
- Context formatting and truncation notices are output contracts; update tests when changing them.
- Rule discovery stays inside canonical cwd/project root unless `includeUserRules` explicitly enables user-home rule dirs.

## ANTI-PATTERNS

- Do not fork bespoke path, lock, state, truncation, or tool-success logic inside individual hooks.
- Do not store raw tool payloads, raw session IDs, or secrets in plugin-data files.
- Do not follow symlink/archive/path traversal behavior without canonical boundary tests.

## VERIFICATION

- Shared changes need direct tests in `tests/hooks/shared-*`, `dynamic-truncator.test.ts`, or `rules-injector-*` helper tests.
- Also run affected hook integration tests because shared changes fan out to comment-checker, directory injectors, rules-injector, and write guard.
