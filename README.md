# Hook Pack

Claude Code plugin shipping five default-enabled hooks: `comment-checker`, `directory-agents-injector`, `directory-readme-injector`, `rules-injector`, `write-existing-file-guard`.

## Install

In Claude Code:

```
/plugin marketplace add cosminfuica/hook-pack
/plugin install hook-pack@cosminfuica
```

Restart Claude Code, then `/hooks` to confirm the five hooks are registered. All five are enabled by default.

Override per project in `.claude/hook-pack.local.md` (gitignored):

```markdown
---
disabled_hooks: write-existing-file-guard
include_user_rules: true
max_context_chars: 30000
---
```

Available fields: `enabled_hooks`, `disabled_hooks`, `enable_all_hooks_by_default`, `max_context_chars` (default `20000`), `include_user_rules` (default `false`).

Per-session state (read tokens, dedupe caches, pending checker calls) is cleared on `PreCompact` and `SessionEnd`, plus opportunistically during normal hook execution.

## Contributing

Requires Node 20+.

```bash
npm install
npm run build         # tsc + esbuild bundle
npm run typecheck
npm test              # builds, then runs node --test dist/tests/**/*.test.js
npm run validate:plugin
```

All four must pass before opening a PR. After any source change touching runtime code, **rebuild and commit `dist/hook-pack-dispatch.mjs`** so `/plugin install` keeps working from a fresh clone.

New built-in hooks need a complete Migration Feasibility Record in `docs/architecture/migration-governance.md` before being added to `BUILT_IN_REGISTRY`. See `docs/architecture/hook-pack-foundation.md` for the runtime architecture.

Runtime state lives under `${CLAUDE_PLUGIN_DATA}` only. Shipped sources must contain no orchestration-specific identifiers; `tests/orchestration-neutrality.test.ts` enforces this.
