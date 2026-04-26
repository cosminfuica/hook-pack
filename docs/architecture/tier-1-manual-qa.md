# Tier 1 Manual Dispatcher QA

Date: 2026-04-27
Status: passed against compiled dispatcher

All commands were run from the plugin worktree after `npm run build`, using `dist/src/cli/dispatch.js` and temporary workspaces/data directories.

## PreToolUse write guard

Fixture: existing `src/a.ts`, `Write` without a same-session read token.

Observed output excerpt:

```json
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"File already exists. Use edit tool instead."},"systemMessage":"write-existing-file-guard: File already exists. Use edit tool instead."}
```

Result: passed. Unsafe existing write was denied with the reference message.

## PostToolUse context and lifecycle cleanup

Fixture: successful `Read` of `src/a.ts` with `src/AGENTS.md`, root `README.md`, and `.claude/rules/typescript.md` present. Then `PreCompact`, then the same `Read` again.

Observed first/third `PostToolUse` excerpts:

```json
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"directory-agents-injector: [Directory Context: src/AGENTS.md]\nUse exact types.\n\n\ndirectory-readme-injector: [Project README: README.md]\nRead project context.\n\n\nrules-injector: [Rule: .claude/rules/typescript.md]\n[Match: glob: src/**/*.ts]\nUse project rule.\n"}}
```

Result: passed. Context was injected, `PreCompact` exited 0 with no output, and the next read re-injected context.

## Comment checker finding block

Fixture: non-existing `src/new.ts`, fake checker command printing `Unnecessary comment detected` to stderr and exiting `2`.

Observed `PostToolUse` output:

```json
{"decision":"block","reason":"Unnecessary comment detected","systemMessage":"comment-checker: Unnecessary comment detected"}
```

Result: passed. Finding blocked continuation through the top-level `PostToolUse` block shape.

## Same-session write guard concurrency

Fixture: one successful `Read` token in `race-session`, followed by two concurrent `PreToolUse Write` dispatcher processes for the same file.

Observed outputs included one deny and one allow:

```text
allow=1 deny=1
```

Result: passed. Exactly one process consumed the read token.

## Cross-session write guard race

Fixture: one successful `Read` token in `race-a` and one in `race-b`, followed by concurrent writes from both sessions to the same file.

Observed outputs included one deny and one allow:

```text
allow=1 deny=1
```

Result: passed. One session consumed a token and invalidated the other under the path lock.

## Copied-plugin bundled runtime

Fixture: copied `.claude-plugin/`, `hooks/`, and `dist/` to a temporary plugin directory, removed `node_modules`, and ran `hooks/dispatch.sh Notification` with `CLAUDE_PLUGIN_ROOT` set to that copied plugin.

Observed output:

```text
bundle-exit=0
```

Result: passed. No `ERR_MODULE_NOT_FOUND` occurred, proving the installed-plugin runtime can use the bundled dispatcher without repo `node_modules`.
