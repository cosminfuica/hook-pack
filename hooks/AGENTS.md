# hooks/ — Plugin Registration Surface

## OVERVIEW

Shipped Claude Code hook integration layer. Keep it small: plugin wrapper JSON plus shell handoff only; all policy starts after dispatcher entry.

## WHERE TO LOOK

| Task              | Location                         | Notes                                                               |
| ----------------- | -------------------------------- | ------------------------------------------------------------------- |
| Registered events | `hooks.json`                     | Optional `description`; required top-level `hooks` wrapper.         |
| Shell handoff     | `dispatch.sh`                    | Validates event arg and `${CLAUDE_PLUGIN_ROOT}`.                    |
| Runtime source    | `../src/cli/dispatch.ts`         | Reads stdin and calls core dispatcher.                              |
| Validation        | `../scripts/validate-plugin.mjs` | Enforces wrapper shape, command substring, timeout, executable bit. |

## CONVENTIONS

- Hook config format is plugin wrapper form: `{ "description"?: string, "hooks": { "Event": [{ "hooks": [...] }] } }`.
- Registered events: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `PreCompact`, `Notification`, `SessionEnd`.
- Each event uses one command hook: `bash "${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh" <EventName>`.
- Timeout is exactly `10` for every registration; built-in registry timeouts must stay below this operational ceiling.
- Omitted matcher means all invocations for that event reach the central dispatcher.
- `dispatch.sh` prefers `dist/hook-pack-dispatch.mjs`, then falls back to `dist/src/cli/dispatch.js`.
- Keep `${CLAUDE_PLUGIN_ROOT}` quoted; plugin install paths may contain spaces.
- Hook commands run from Claude's current cwd; never rely on relative paths from process cwd.

## ANTI-PATTERNS

- Do not put hook selection, config parsing, path checks, registry logic, or output policy in `hooks.json`.
- Do not call per-hook scripts directly unless architecture intentionally abandons central dispatch.
- Do not hardcode workspace, cache, `$HOME`, or maintainer-machine paths.
- Do not remove executable bit from `dispatch.sh`; validator and scaffold tests check it.
- Do not rely on `dist/src/**` being present in installed plugin copies; runtime bundle tests delete it.

## CHANGE CHECKLIST

- Event list changed -> update `src/core/events.ts`, `src/core/registry.ts`, tests, docs/configuration, and validator expectations if command shape changes.
- Command shape changed -> update `scripts/validate-plugin.mjs`, `tests/plugin-scaffold.test.ts`, and `tests/validate-plugin.test.ts`.
- Wrapper behavior changed -> run `npm run build`, `npm test`, and `npm run validate:plugin`.
