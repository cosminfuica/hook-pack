# src/hooks/rules-injector/ — Rule Context Hook

## OVERVIEW

PostToolUse context injector for project/user rule files. It discovers matching rules for the touched file, dedupes per session, and emits `additionalContext` blocks.

## WHERE TO LOOK

| Task              | Location                                       | Notes                                                                        |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Handler           | `index.ts`                                     | Event gating, target path, project root, session dedupe, context formatting. |
| Parsed cache      | `parsed-rule-cache.ts`                         | Persistent parsed-rule cache under plugin data.                              |
| Discovery helpers | `../shared/rule-discovery*.ts`                 | Rule scan, matching, realpath/content dedupe.                                |
| Tests             | `../../../tests/hooks/rules-injector*.test.ts` | Main behavior, storage, cache, parser, finder, scanner.                      |

## CONVENTIONS

- Hook runs on successful `PostToolUse` for `Read`, `Write`, `Edit`, and `MultiEdit` only.
- Target path comes from tool input first, then response metadata via shared `extractPostToolPath`.
- Canonical target must stay inside canonical cwd; project root detection must not escape cwd.
- Session state tracks injected realpaths and content hashes under `rules-injector/sessions`.
- Scan cache is per session and is removed on `PreCompact`/`SessionEnd`; parsed-rule cache persists across sessions.
- User-home rules require `context.userConfig.includeUserRules`; default is project rules only.
- Context format: `[Rule: path]\n[Match: reason]\nbody` plus stable truncation notice when needed.

## ANTI-PATTERNS

- Do not run on PreToolUse; native Claude Code port is PostToolUse context injection.
- Do not include user-home rules by default.
- Do not dedupe only by path; duplicate contents across symlinks/copies must stay suppressed.
- Do not scan ignored/generated dirs listed by shared rule discovery.

## VERIFICATION

- Behavior changes: `npm run build` then `node --test dist/tests/hooks/rules-injector.test.js`.
- Discovery/cache/parser changes: run matching `rules-injector-*` tests and affected shared tests.
