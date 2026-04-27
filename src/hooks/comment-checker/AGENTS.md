# src/hooks/comment-checker/ — Comment Policy Hook

## OVERVIEW

Two-phase write/edit comment checker. `PreToolUse` records sanitized pending metadata; `PostToolUse` runs checker on final file content after successful write/edit-style tools.

## WHERE TO LOOK

| Task                  | Location                                        | Notes                                                             |
| --------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Handler orchestration | `index.ts`                                      | Event gating, pending key, runner budget, block/fail-open result. |
| Pending state         | `pending-store.ts`                              | Per-session pending checks under plugin data.                     |
| Binary resolution     | `binary-resolver.ts`                            | Env override and cached binary path.                              |
| Download/cache        | `downloader.ts`, `lock-store.ts`                | GitHub release asset, SHA256, tar safety, locks.                  |
| Runner                | `runner.ts`                                     | External checker command execution and output parsing.            |
| Tests                 | `../../../tests/hooks/comment-checker*.test.ts` | Hook, downloader, runner, pending-store contracts.                |

## CONVENTIONS

- Tracked tools are `Write`, `Edit`, and `MultiEdit` after lowercasing.
- Missing session, plugin data, tracked file path, cwd containment, or successful tool response yields empty result.
- Pending state stores only sanitized metadata needed to reconstruct checker input; avoid raw tool payload persistence.
- Checker unavailable, timeout, abort, download failure, unreadable final file, or state failure fails open.
- Checker findings block with `stopDecision: "block"` and checker message.
- Default download is pinned to release `0.7.0` with SHA256 per platform/arch; Windows has no default asset.
- Downloads stay under `${CLAUDE_PLUGIN_DATA}/comment-checker/bin`, enforce max bytes, safe tar entries, regular file checks, executable bit, and temp+rename writes.

## ANTI-PATTERNS

- Do not fail closed when checker binary is unavailable; policy intentionally fails open except actual findings.
- Do not expand archive extraction without traversal, symlink, hardlink, and max-size tests.
- Do not store full file contents or raw edit payloads in pending state.
- Do not restore apply-patch behavior until Claude runtime metadata can identify patch edits portably.

## VERIFICATION

- Handler changes: `npm run build` then `node --test dist/tests/hooks/comment-checker.test.js`.
- Downloader/cache changes: run `comment-checker-downloader`, `comment-checker-runner`, and `comment-checker-pending-store` tests plus full `npm test` for supply-chain-sensitive edits.
