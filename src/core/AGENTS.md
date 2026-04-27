# src/core/ — Runtime Contracts

## OVERVIEW

Core owns native event normalization, config, runtime context, registry selection, isolated execution, and Claude hook output shaping. Hook implementations consume typed core contracts; they do not parse raw stdin or config.

## WHERE TO LOOK

| Task                      | Location                                         | Notes                                                                                    |
| ------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Supported native events   | `events.ts`                                      | `SUPPORTED_EVENTS`, `REGISTERED_DISPATCH_EVENTS`, matcher behavior, output capabilities. |
| User config               | `config.ts`                                      | Defaults, plugin env vars, `.claude/hook-pack.local.md`.                                 |
| Runtime env               | `runtime-context.ts`                             | `CLAUDE_PLUGIN_DATA`, debug flag, user config, clock.                                    |
| Built-in registry         | `registry.ts`                                    | Stable hook IDs, events, timeout, default enablement.                                    |
| Dispatch                  | `dispatcher.ts`                                  | Validate registry, select entries, run concurrently, fail safely.                        |
| Entry execution           | `entry-runner.ts`                                | Internal handler vs command spec, command output normalization.                          |
| Output merge              | `output.ts`                                      | Permission/block/context conflict rules.                                                 |
| Diagnostics/JSON/commands | `diagnostics.ts`, `json.ts`, `command-runner.ts` | Safe messages, JSON helpers, external command execution.                                 |

## CONVENTIONS

- Raw input becomes `HookEnvelope` before hook code sees it.
- Config precedence: `DEFAULT_CONFIG` -> `CLAUDE_PLUGIN_OPTION_*` env -> project-local `.claude/hook-pack.local.md`.
- `disabledHooks` wins over defaults and explicit enables.
- `BUILT_IN_REGISTRY` is the only built-in runtime entry list; registry IDs use lower-kebab-case and must match `src/hooks/index.ts` handler IDs.
- Registry timeout range is `1..60000` ms; event-level `hooks.json` timeout is fixed at 10 seconds, so built-ins should stay below that ceiling.
- Selected entries run concurrently; output merge sorts by `hookId` for deterministic output.
- `PreToolUse` permission priority is `deny > ask > allow`; blocking outputs must not be hidden by context-only hooks.
- Dispatcher failures fail closed for `PreToolUse`, block for `PostToolUse`/`Stop`/`SubagentStop`, and become context for other events.
- Event input schema may grow; normalize known fields and preserve raw object for future-safe access.

## ANTI-PATTERNS

- Do not add unknown config fields without manifest, parser, docs, and tests updates.
- Do not move runtime state resolution out of `runtime-context.ts` or write source-tree state from core.
- Do not introduce OpenCode/Omo/Sisyphus identifiers into shipped source.
- Do not add registry entries without handler map entries, focused tests, docs/config updates, and portability review.
- Do not make `validate:plugin` claims here that are not enforced by `scripts/validate-plugin.mjs`.

## VERIFICATION

- Core changes normally need targeted `tests/*.test.ts` plus `npm run typecheck`.
- Registry/manifest/hook event changes also need `npm test` and `npm run validate:plugin`.
