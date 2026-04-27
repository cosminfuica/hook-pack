# scripts/ — Build and Validation Utilities

## OVERVIEW

Source-maintained Node ESM helper scripts. They create the install-critical runtime bundle and validate plugin structure after build.

## WHERE TO LOOK

| Task              | Location                          | Notes                                                                      |
| ----------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Runtime bundling  | `bundle-runtime.mjs`              | esbuild entry `dist/src/cli/dispatch.js` -> `dist/hook-pack-dispatch.mjs`. |
| Plugin validation | `validate-plugin.mjs`             | Manifest, hooks wrapper, executable bit, dist artifacts, registry IDs.     |
| Package scripts   | `../package.json`                 | `build`, `bundle:runtime`, `validate:plugin`.                              |
| Bundle tests      | `../tests/runtime-bundle.test.ts` | Copied plugin must run without `node_modules` or `dist/src`.               |

## CONVENTIONS

- Scripts are `.mjs` ESM sources; do not convert to TypeScript unless package scripts and tests are updated.
- `bundle-runtime.mjs` runs after TypeScript compile; its entry must remain a compiled JS file under `dist/src`.
- Bundle target is Node 20 ESM with dependencies bundled; installed plugin copies cannot rely on `node_modules`.
- `validate-plugin.mjs` validates current enforceable facts only: manifest name/version/userConfig, hooks wrapper, command substring, timeout `10`, executable `dispatch.sh`, bundled dispatcher, generated registry artifact IDs.
- Validator parses `dist/src/core/registry.js`, so `npm run validate:plugin` must build first.

## ANTI-PATTERNS

- Do not broaden validator checks with brittle source-text assumptions unless tests cover failure and success cases.
- Do not claim validator checks governance records; current script does not.
- Do not make bundle output depend on current cwd outside repo root or on maintainer-machine paths.
- Do not hand-edit `dist/hook-pack-dispatch.mjs`; regenerate through `npm run build`.

## VERIFICATION

- Script changes require `npm run build`, `npm run typecheck`, targeted script tests if available, `npm test`, and `npm run validate:plugin`.
