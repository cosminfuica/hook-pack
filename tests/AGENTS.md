# tests/ — Executable Contracts

## OVERVIEW

Tests are TypeScript sources compiled into generated `dist/tests/**` before execution. Edit `tests/**`, never `dist/tests/**`.

## WHERE TO LOOK

| Task                 | Location                                           | Notes                                                                          |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Shared hook fixtures | `helpers/hook-fixtures.ts`                         | Temp workspace, plugin-data, envelopes, child Node runner.                     |
| CLI smoke            | `cli.test.ts`                                      | End-to-end compiled dispatcher behavior plus command/internal entry execution. |
| Plugin scaffold      | `plugin-scaffold.test.ts`                          | Manifest, hooks wrapper, dispatch script, executable bit.                      |
| Runtime bundle       | `runtime-bundle.test.ts`                           | Bundled plugin runs without `node_modules` or `dist/src`.                      |
| Validator            | `validate-plugin.test.ts`                          | Manifest/hook/dist/registry artifact checks.                                   |
| Docs/neutrality      | `docs.test.ts`, `orchestration-neutrality.test.ts` | README/config coverage and no OpenCode/Omo/Sisyphus in shipped surfaces.       |
| Hook behavior        | `hooks/*.test.ts`                                  | Built-in hooks and shared helper contracts.                                    |

## CONVENTIONS

- Use `node:test` and `node:assert/strict`; no Jest/Vitest harness exists.
- Files use `*.test.ts`; hook tests usually mirror hook IDs or shared module names.
- Tests import TS source using `.js` specifiers because NodeNext emits ESM.
- Fixtures are temp-dir based with `mkdtempSync(join(tmpdir(), "hook-pack-..."))`; no static fixture tree.
- Use `withHookFixture`, `makePreToolEnvelope`, `makePostToolEnvelope`, and `makeLifecycleEnvelope` when possible.
- Cross-process behavior uses spawned Node child scripts; keep plugin-data directories isolated per test.

## COMMANDS

```bash
npm run build
node --test dist/tests/cli.test.js
node --test dist/tests/hooks/write-existing-file-guard.test.js
npm test
```

## ANTI-PATTERNS

- Do not target `dist/tests/**` until after build; it may not exist and is generated.
- Do not run `node --test tests/**/*.test.ts`; compile first.
- Do not weaken exact output/message assertions for permission, block, context, or validator errors without updating source contract docs.
- Do not add runtime hook behavior without red/targeted tests first.
- Do not share plugin-data temp dirs across tests; stateful hooks rely on per-session files and locks.
- Do not assume `validate:plugin` checks architecture governance docs; current validator tests accept registry IDs without those docs.

## REQUIRED VERIFICATION

- Source/test-only change: `npm run typecheck` and relevant `node --test dist/tests/...` after build.
- Hook/config/manifest/scaffold change: full `npm test` plus `npm run validate:plugin`.
