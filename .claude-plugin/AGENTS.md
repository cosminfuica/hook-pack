# .claude-plugin/ — Plugin Metadata

## OVERVIEW

Claude Code plugin metadata and marketplace listing. This directory defines install identity, user option schema, and public package listing; it does not contain runtime hook logic.

## WHERE TO LOOK

| Task                | Location                         | Notes                                                                    |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Plugin manifest     | `plugin.json`                    | `name`, `version`, description, author, license, keywords, `userConfig`. |
| Marketplace listing | `marketplace.json`               | Marketplace owner and `cosminfuica/hook-pack` source metadata.           |
| Validator           | `../scripts/validate-plugin.mjs` | Checks manifest JSON, `name`, semver, `userConfig`.                      |
| Config parser       | `../src/core/config.ts`          | Runtime mapping from plugin env names to typed config.                   |

## CONVENTIONS

- `plugin.json.name` must stay `hook-pack`; `validate:plugin` enforces this exact value.
- `plugin.json.version` must be strict `x.y.z` semver.
- `userConfig` keys use snake*case because Claude plugin env vars become `CLAUDE_PLUGIN_OPTION*\*`.
- Current userConfig fields: `enabled_hooks`, `disabled_hooks`, `enable_all_hooks_by_default`, `max_context_chars`, `include_user_rules`.
- `disabled_hooks` wins over defaults and explicit enables; keep manifest copy aligned with `src/core/config.ts` and `docs/configuration.md`.
- Marketplace description names the five default-enabled hooks; update it when default shipped hooks change.

## ANTI-PATTERNS

- Do not put hook registration JSON in `.claude-plugin/`; default plugin hooks live at `../hooks/hooks.json`.
- Do not add config fields here without parser, docs, and tests.
- Do not store secrets, install-local paths, or maintainer-machine URLs in metadata.

## VERIFICATION

- Manifest/listing change: `npm run validate:plugin` plus `npm test` if schema, hook list, or marketplace copy changes.
