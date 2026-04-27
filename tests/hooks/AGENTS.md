# tests/hooks/ — Hook Behavior Tests

## OVERVIEW

Executable contracts for built-in hooks and shared hook utilities. These tests protect plugin-data state, path safety, lifecycle cleanup, context output, supply-chain downloads, and fail-open/fail-closed decisions.

## WHERE TO LOOK

| Task              | Location                                                                 | Notes                                                   |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| Comment checker   | `comment-checker*.test.ts`                                               | Handler, downloader, runner, pending store.             |
| Directory context | `directory-agents-injector.test.ts`, `directory-readme-injector.test.ts` | Shared traversal and session dedupe.                    |
| Rules injector    | `rules-injector*.test.ts`                                                | Main hook, storage, parser, finder, scanner, caches.    |
| Shared helpers    | `shared-*.test.ts`, `dynamic-truncator.test.ts`                          | Path, context, state store, truncation.                 |
| Write guard       | `write-existing-file-guard*.test.ts`                                     | Permission flow, token store, cross-process locks.      |
| Fixtures          | `../helpers/hook-fixtures.ts`                                            | Envelope builders and temp workspace/plugin-data setup. |

## CONVENTIONS

- Keep plugin-data isolated per test; use fixture `dataDir` or explicit temp dirs.
- Test both direct shared helpers and affected hook integration when shared helper behavior changes.
- For lifecycle cleanup use `makeLifecycleEnvelope("PreCompact" | "SessionEnd", ...)`.
- For cross-process state, spawn compiled JS after `npm run build`; do not import TS directly in child scripts.
- Preserve path traversal, symlink, corrupt JSON, stale lock, and concurrent write/read coverage.
- Large downloader tests are intentional because binary download/extraction is security-sensitive.

## ANTI-PATTERNS

- Do not delete or relax race/concurrency tests to make suite pass.
- Do not replace temp dirs with checked-in fixtures for stateful plugin-data behavior.
- Do not remove exact denial/context text assertions without updating runtime contracts.

## VERIFICATION

- After editing a hook test: `npm run build` then `node --test dist/tests/hooks/<file>.test.js`.
- Shared or state/lock edits: run relevant hook-specific tests plus full `npm test`.
