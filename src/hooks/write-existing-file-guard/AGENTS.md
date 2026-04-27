# src/hooks/write-existing-file-guard/ — Write Safety Hook

## OVERVIEW

Fail-closed overwrite guard for `Write`. Existing in-cwd files require a successful same-session `Read` token matching current file fingerprint before write permission is allowed.

## WHERE TO LOOK

| Task           | Location                                                  | Notes                                                                                  |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Handler        | `index.ts`                                                | Read token grants, Write permission decisions, plugin-data bypass, overwrite handling. |
| Token store    | `token-store.ts`                                          | Fingerprinted tokens, per-path locks, stale lock cleanup, LRU trimming.                |
| Tests          | `../../../tests/hooks/write-existing-file-guard*.test.ts` | Main behavior, token store, cross-process concurrency.                                 |
| Shared helpers | `../shared/path.ts`, `../shared/tool-output.ts`           | Path aliases, canonicalization, successful Read detection.                             |

## CONVENTIONS

- Successful `PostToolUse` `Read` grants token only for existing canonical path inside cwd.
- `PreToolUse` `Write` to missing in-cwd files returns empty result; existing files require token unless overwrite flag is enabled.
- Paths inside canonical `${CLAUDE_PLUGIN_DATA}` are explicitly allowed.
- Outside-cwd writes are ignored by this guard, not denied.
- Existing file fingerprint is `realpath`, `mtimeMs`, `size`, `dev`, `ino`; unreadable fingerprint fails closed.
- `overwrite: true` or string `"true"` allows, strips `overwrite` from updated input, and invalidates other session tokens. Locked invalidation denies.
- Store caps: `MAX_TRACKED_SESSIONS = 256`, `MAX_TRACKED_PATHS_PER_SESSION = 1024`.

## ANTI-PATTERNS

- Do not weaken `BLOCK_MESSAGE`; tests assert exact denial copy.
- Do not treat read tokens as path-only; fingerprint must match current file.
- Do not share raw session IDs or paths as filenames; token store must keep safe encoded/hash keys.
- Do not fail open when plugin data is missing for an existing in-cwd write.

## VERIFICATION

- Handler change: `npm run build` then `node --test dist/tests/hooks/write-existing-file-guard.test.js`.
- Token/lock change: add `write-existing-file-guard-token-store` and `write-existing-file-guard-cross-process` tests, then run full `npm test`.
