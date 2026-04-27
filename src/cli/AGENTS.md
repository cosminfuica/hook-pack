# src/cli/ — Dispatch Entrypoint

## OVERVIEW

Thin Node ESM CLI boundary for Claude hook stdin. It normalizes input, loads config/runtime context, calls core dispatcher, and writes Claude-compatible output.

## WHERE TO LOOK

| Task                | Location                                          | Notes                                                             |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Entrypoint          | `dispatch.ts`                                     | `main()`, stdin read, `process.argv[2]` event name, output write. |
| Input normalization | `../core/events.ts`                               | Throws `HookInputError` for unsupported/malformed event data.     |
| Config/context      | `../core/config.ts`, `../core/runtime-context.ts` | Plugin env + local config + `${CLAUDE_PLUGIN_DATA}`.              |
| Dispatcher          | `../core/dispatcher.ts`                           | Registry validation, selection, execution, output merge.          |
| CLI tests           | `../../tests/cli.test.ts`                         | End-to-end compiled dispatcher behavior.                          |

## CONVENTIONS

- Read all stdin as UTF-8, parse JSON once, and pass unknown raw data to `normalizeHookInput`.
- Event name comes from `process.argv[2]`; `hooks/dispatch.sh` supplies it.
- Write nothing to stdout for empty hook output; Claude hook JSON goes to stdout only when non-empty.
- Errors go to stderr and set non-zero exit code via `process.exitCode = 1`.
- CLI wires dependencies; hook behavior belongs in `src/core` or `src/hooks`, not here.

## ANTI-PATTERNS

- Do not parse hook-specific tool input in CLI.
- Do not read project-local config directly here; use `loadConfig`.
- Do not write logs/debug text to stdout; it would corrupt Claude hook JSON.
- Do not assume process cwd is plugin root.

## VERIFICATION

- CLI changes: `npm run build`, targeted `node --test dist/tests/cli.test.js`, then `npm test` for output contract changes.
