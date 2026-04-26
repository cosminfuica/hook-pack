# tests/ — Executable Contracts

## OVERVIEW

Tests are TypeScript sources compiled into generated `dist/tests/**` before execution. Edit `tests/**`, never `dist/tests/**`.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Shared hook fixtures | `helpers/hook-fixtures.ts` | Temp workspace, plugin-data, envelopes, child Node runner. |
| CLI smoke | `cli.test.ts` | End-to-end compiled dispatcher behavior. |
| Plugin scaffold | `plugin-scaffold.test.ts` | Manifest, hooks wrapper, dispatch script. |
| Runtime bundle | `runtime-bundle.test.ts` | Bundled plugin runs without `node_modules` or `dist/src`. |
| Validator | `validate-plugin.test.ts` | Manifest/hook/governance artifact checks. |
| Governance docs | `docs.test.ts`, `orchestration-neutrality.test.ts` | Docs coverage and shipped-source neutrality. |
| Hook behavior | `hooks/*.test.ts` | Tier 1 hooks and shared helpers. |

## CONVENTIONS

- Use `node:test` and `node:assert/strict`; no Jest/Vitest harness exists.
- Files use `*.test.ts`; hook tests usually mirror hook IDs or shared module names.
- Fixtures are temp-dir based with `mkdtempSync(join(tmpdir(), "hook-pack-..."))`; no static fixture tree.
- Use `withHookFixture`, `makePreToolEnvelope`, `makePostToolEnvelope`, and `makeLifecycleEnvelope` when possible.
- Tests import TypeScript source using `.js` specifiers because NodeNext emits ESM.
- Cross-process behavior uses spawned Node child scripts; keep plugin-data directories isolated per test.

## COMMANDS

```bash
npm run build
node --test dist/tests/cli.test.js
node --test dist/tests/hooks/write-existing-file-guard.test.js
npm test
```

## ANTI-PATTERNS

- Do not target `dist/tests` until after build; it may not exist.
- Do not weaken exact output/message assertions for permission, block, context, or validator errors without updating source contract docs.
- Do not add runtime hook behavior without red/targeted tests first.
- Do not share plugin-data temp dirs across tests; stateful hooks rely on per-session files and locks.

## REQUIRED VERIFICATION

- Source/test-only change: `npm run typecheck` and relevant `node --test dist/tests/...` after build.
- Hook/config/governance change: full `npm test` plus `npm run validate:plugin`.
