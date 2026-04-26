# src/core/ — Runtime Contracts

## OVERVIEW

Core owns native event normalization, config, runtime context, registry selection, isolated execution, and Claude hook output shaping.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Supported native events | `events.ts` | `SUPPORTED_EVENTS`, `REGISTERED_DISPATCH_EVENTS`, `HookEnvelope`. |
| User config | `config.ts` | Defaults, plugin env vars, `.claude/hook-pack.local.md`. |
| Runtime env | `runtime-context.ts` | `CLAUDE_PLUGIN_DATA`, debug flag, user config, clock. |
| Built-in registry | `registry.ts` | Stable hook IDs, events, timeout, default enablement. |
| Dispatch | `dispatcher.ts` | Validate registry, select entries, run in parallel, fail safely. |
| Entry execution | `entry-runner.ts` | Internal handler vs command spec, command JSON normalization. |
| Output merge | `output.ts` | Permission/block/context conflict rules. |

## CONVENTIONS

- Raw input becomes `HookEnvelope` before hook code sees it; do not let hook implementations parse raw stdin.
- Config precedence: `DEFAULT_CONFIG` -> `CLAUDE_PLUGIN_OPTION_*` env -> project-local `.claude/hook-pack.local.md`.
- `disabledHooks` wins over defaults and explicit enables.
- `BUILT_IN_REGISTRY` is the only built-in runtime entry list.
- Registry IDs use lower-kebab-case and must match handler IDs in `src/hooks/index.ts`.
- Registry timeout range is validated; event-level `hooks.json` timeout is fixed at 10 seconds.
- Selected entries run concurrently; output merge must stay deterministic.
- Dispatcher failures fail closed for `PreToolUse`, block for `PostToolUse`/`Stop`/`SubagentStop`, and become context for other events.

## ANTI-PATTERNS

- Do not add registry entries without a portable migration record in `docs/architecture/migration-governance.md`.
- Do not add unknown config fields without manifest, parser, tests, and docs updates.
- Do not move runtime state resolution out of `runtime-context.ts` or source tree writes into core.
- Do not weaken output priority: deny > ask > allow; blocking results must not be hidden by context-only hooks.
- Do not introduce OpenCode/Omo/Sisyphus identifiers into shipped source.

## VERIFICATION

- Core changes normally need targeted tests in `tests/*.test.ts` plus `npm run typecheck`.
- Registry/manifest/governance changes also need `npm run validate:plugin`.
