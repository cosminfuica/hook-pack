# docs/ — User Docs

## OVERVIEW

## WHERE TO LOOK

| Task                  | Location                  | Notes                                                                   |
| --------------------- | ------------------------- | ----------------------------------------------------------------------- |
| User config reference | `configuration.md`        | Shipped hooks, user config fields, lifecycle cleanup, state path rules. |
| Runtime truth         | `../src/core/registry.ts` | Authoritative shipped hook list.                                        |
| Docs tests            | `../tests/docs.test.ts`   | README/config docs coverage expectations.                               |

## CONVENTIONS

- `configuration.md` must keep hook IDs/events aligned with `BUILT_IN_REGISTRY` and manifest user config.
- State docs must keep `${CLAUDE_PLUGIN_DATA}` as only persistent runtime location.
- Current tree has no `docs/architecture/**`; do not cite missing architecture docs as current validator-enforced requirements.

## ANTI-PATTERNS

- Do not copy private names or paths (`OpenCode`, `Omo`, `Sisyphus`, `Atlas`, `Prometheus`, `Boulder`, `.sisyphus`, `OPENCODE_*`) into `src/**`, `hooks/hooks.json`, or `.claude-plugin/plugin.json`.
- Do not store secrets in examples, local-config snippets, fixtures, or generated state examples.

## VERIFICATION

- Docs/config change: run `npm run typecheck` and `npm test` if README/config/hook IDs are touched.
