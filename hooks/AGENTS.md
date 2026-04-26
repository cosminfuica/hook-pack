# hooks/ — Plugin Registration Surface

## OVERVIEW

This directory is the shipped Claude Code hook integration layer. Keep it small: registration and wrapper only, no policy logic.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Registered events | `hooks.json` | Top-level `description` optional; top-level `hooks` wrapper required. |
| Shell handoff | `dispatch.sh` | Validates event arg and `${CLAUDE_PLUGIN_ROOT}`. |
| Runtime source | `../src/cli/dispatch.ts` | Business logic starts after wrapper handoff. |
| Validation | `../scripts/validate-plugin.mjs` | Enforces wrapper format, command substring, timeout, executable bit. |

## CONVENTIONS

- Hook config format is plugin wrapper form:
  `{ "description": "...", "hooks": { "Event": [{ "hooks": [...] }] } }`.
- Each registered event uses one command hook:
  `bash "${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh" <EventName>`.
- Current timeout is `10` for every registration; built-in registry timeouts must stay below this operational ceiling.
- Omitted matcher means all invocations for that event reach the central dispatcher.
- `dispatch.sh` prefers `dist/hook-pack-dispatch.mjs`, then falls back to `dist/src/cli/dispatch.js`.
- Keep `${CLAUDE_PLUGIN_ROOT}` quoted; plugin install paths may contain spaces.

## ANTI-PATTERNS

- Do not put hook selection, config parsing, path checks, or output policy in `hooks.json`.
- Do not call per-hook scripts directly unless architecture intentionally abandons central dispatch.
- Do not hardcode workspace, cache, or maintainer-machine paths.
- Do not remove executable bit from `dispatch.sh`; validator checks it.
- Do not rely on `dist/**` before `npm run build`.

## CHANGE CHECKLIST

- Event list changed -> update `src/core/events.ts`, `src/core/registry.ts`, tests, docs, and validation expectations.
- Command shape changed -> update `scripts/validate-plugin.mjs` and scaffold tests.
- Wrapper behavior changed -> run `npm run build`, `npm test`, and `npm run validate:plugin`.
