# Hook Pack Foundation Architecture

## Foundation statement

Native Claude Code events are the runtime boundary. Hook Pack runs only through Claude Code hook events registered in `hooks/hooks.json`, normalized by the event adapter, then dispatched through the runtime registry.

OpenCode reference hooks are migration inventory. They record prior intent, policy shape, or operational lessons, but they are not an API, runtime dependency, or compatibility contract for Hook Pack.

## Runtime boundary

Hook Pack accepts the native Claude Code hook envelope from stdin. The event name comes from the dispatcher argument passed by `hooks/dispatch.sh`. The foundation currently registers this subset of native Claude Code events:

1. `SessionStart`
2. `UserPromptSubmit`
3. `PreToolUse`
4. `PostToolUse`
5. `Stop`
6. `SubagentStop`
7. `PreCompact`
8. `Notification`

Anything outside that registered subset must be redesigned before it can enter Hook Pack. OpenCode lifecycle concepts, shell wrappers, or private coordinator state do not cross this boundary unless mapped into a native Claude Code event with a documented reason.

## Layers

### Plugin registration layer

`.claude-plugin/plugin.json` declares plugin metadata and user configuration options. `hooks/hooks.json` registers one command hook per native event. Registration stays small so policy logic does not live in JSON.

### Shell wrapper layer

`hooks/dispatch.sh` checks required input, checks `${CLAUDE_PLUGIN_ROOT}`, and calls the compiled dispatcher. It keeps path handling portable and avoids hardcoded install locations.

### Event adapter layer

The TypeScript event adapter parses stdin, validates event shape, and returns a normalized envelope. Event-specific fields remain explicit so every hook runner sees the same typed contract.

### Config layer

Config merges defaults, Claude Code plugin options, and `.claude/hook-pack.local.md`. Project-local config can enable, disable, or globally enable registry entries, but disabled hook IDs always win.

### Registry layer

`BUILT_IN_REGISTRY` is the only built-in runtime entry list. The foundation phase is complete. Built-in hooks enter the runtime only through `BUILT_IN_REGISTRY`, after migration feasibility records document native Claude Code event mapping, state rules, lifecycle cleanup, failure behavior, tests, and orchestration neutrality.

### Dispatch layer

Dispatch selects registry entries for the current event and config, runs each selected entry in isolation, then merges hook outputs into Claude Code hook output rules.

## State and path rules

1. Use `${CLAUDE_PLUGIN_ROOT}` for files that ship with the plugin.
2. Use `${CLAUDE_PLUGIN_DATA}` for runtime state, caches, generated files, and migration notes that belong to the installed plugin.
3. Use `.claude/hook-pack.local.md` only for user-managed project config.
4. Never write runtime state into source directories, `dist`, `hooks`, or `docs`.
5. Never require an absolute path from a maintainer machine.
6. Never store secrets in local config, docs, tests, snapshots, or generated state.

## Scalability rules

1. One registry entry owns one stable hook ID.
2. Hook IDs use lowercase kebab-case and stay stable once released.
3. Hook implementations must be selected through config, not through new hook JSON registrations.
4. Registry validation must catch duplicate IDs, invalid IDs, invalid timeouts, and unknown configured IDs.
5. Output merging must stay deterministic when multiple hooks run for the same event.
6. New migrations must preserve foundation tests and add focused behavior tests before implementation.
7. Migration records must be reviewed before entries are added to `BUILT_IN_REGISTRY`.

## Foundation limits

The foundation provides the runtime boundary, selection rules, path rules, and governance gate needed to migrate hooks safely. Runtime entries remain governed by completed migration records and focused tests before registry addition.
