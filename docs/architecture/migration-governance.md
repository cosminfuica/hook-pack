# Migration Governance

## Purpose

This document defines the gate for moving a reference hook into Hook Pack runtime code. It prevents accidental compatibility claims and keeps each migrated hook aligned with native Claude Code events.

No hook may be added to `BUILT_IN_REGISTRY` until its Migration Feasibility Record is complete and reviewed.

## Decisions

Each candidate receives one decision:

| Decision | Meaning |
| --- | --- |
| `portable` | The hook can run within native Claude Code events with portable paths and no hidden OpenCode dependency. |
| `redesign-needed` | The hook intent is useful, but the original design depends on OpenCode behavior, private state, unsafe paths, or missing Claude Code event data. It needs a new design before implementation. |
| `not-portable` | The hook does not fit Hook Pack because it depends on unavailable runtime capabilities, unsafe state, non-portable assumptions, or behavior outside the project scope. |

Only `portable` records can proceed toward implementation. A `redesign-needed` record must be updated after redesign. A `not-portable` record must not enter the runtime registry.

## Migration Feasibility Record template

Copy this template for every migration candidate before implementation starts.

```markdown
## Migration Feasibility Record: <stable-id>

Stable ID: <stable-id>
Decision: portable
Reviewer:
Date:

### Reference source

- Source paths consulted:
- Original intent:
- Original trigger:

### Claude Code runtime mapping

- Native events:
- Required hook input fields:
- Expected hook output fields:
- Runtime timeout:

### State and lifecycle

- State location:
- Cross-process safety:
- Lifecycle cleanup:
- Stale-state cleanup:

### Security and failure behavior

- Safe default when input is invalid:
- Dependency/downstream failure behavior:
- Timeout behavior:
- Path validation:
- Failure output shape:

### Tests required before implementation

- Red test names:
- Reference test ports:
- Edge cases:
- Validator checks:

### Orchestration neutrality

- Reference-only identifiers removed or renamed:
- Shipped-source neutrality checks:

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work:
```

## Registry gate

Before adding an entry to `BUILT_IN_REGISTRY`, complete these checks:

1. Record exists in this governance document or a linked migration record.
2. Record includes `Stable ID: <id>` for the exact registry ID.
3. Decision is `portable`.
4. Native Claude Code event mapping is documented.
5. State uses `${CLAUDE_PLUGIN_DATA}` when runtime data is needed.
6. Shipped file references use `${CLAUDE_PLUGIN_ROOT}`.
7. No secrets are present in examples, fixtures, docs, or local config.
8. Failing behavior test was observed before implementation.
9. Validator and targeted tests pass after implementation.

The validator requires governance docs for implemented stable IDs. Reviewers check the remaining gate items before code lands.

## Current foundation status

Tier 1 migration records below are complete before registry entries are added. The runtime registry stays empty until later tasks add tested implementations.

## Migration Feasibility Record: comment-checker

Stable ID: comment-checker
Decision: portable
Reviewer:
Date: 2026-04-26

### Reference source

- Source paths consulted: `docs/reference/hooks/comment-checker/hook.ts`, `docs/reference/hooks/comment-checker/pending-calls.ts`, `docs/reference/hooks/comment-checker/cli-runner.ts`, `docs/reference/hooks/comment-checker/cli.ts`, `docs/reference/hooks/comment-checker/downloader.ts`, `docs/reference/hooks/comment-checker/types.ts`, `docs/reference/hooks/comment-checker/initialization-gate.ts`, `docs/reference/hooks/comment-checker/hook.apply-patch.test.ts`, `docs/reference/hooks/comment-checker/hook.lazy-init.test.ts`, `docs/reference/hooks/comment-checker/cli.test.ts`, `docs/reference/hooks/comment-checker/pending-calls.test.ts`.
- Original intent: capture write/edit/multiedit-style intent, keep pending call metadata for a short TTL, run an external checker after successful tool output, and treat checker exit code `2` as findings.
- Original trigger: pre-tool capture for mutating tool input, post-tool evaluation after successful mutating tool output, and lifecycle cleanup for stale pending calls.
- Missing reference source notes: no shared downloader helper exists outside hook-local `downloader.ts`; port owns Node `child_process.spawn`, `tar` extraction, and plugin-data cache writes. Runtime-proven apply-patch metadata handling is pending Task 7 Step 0 verification: apply_patch parity is conditional on observed Claude runtime metadata. Default fallback: non-portable / dropped if Step 0 evidence is inconclusive, with `docs/reference/hooks/comment-checker/hook.apply-patch.test.ts` retained only as reference evidence.

### Claude Code runtime mapping

- Native events: `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd`.
- Required hook input fields: `session_id`, tool name, tool input path/content for `Write`, `Edit`, and `MultiEdit`, post-tool success output, and optional raw tool-call identifiers when Claude provides them.
- Expected hook output fields: no output for capture and unavailable checker paths; findings produce a blocking hook result with `stopDecision: "block"` and remediation text so the agent fixes comments.
- Runtime timeout: registry timeout is fail-closed through the dispatcher; resolver, downloader, and runner each use hook-owned abortable fail-open budgets below the registry timeout.

### State and lifecycle

- State location: `${CLAUDE_PLUGIN_DATA}/comment-checker/pending-calls.json` for pending metadata and `${CLAUDE_PLUGIN_DATA}/comment-checker/bin` for downloaded binaries.
- Cross-process safety: pending metadata uses plugin-data JSON state with temp-file rename and a mkdir lock; binary cache writes use a plugin-data mkdir lock and reject archive paths outside the bin directory.
- Lifecycle cleanup: `PreCompact` and `SessionEnd` prune pending calls for the session and release stale lock ownership when possible.
- Stale-state cleanup: normal execution prunes pending calls older than `60_000` ms, cleans stale locks, and revalidates cached binary paths before use.

### Security and failure behavior

- Safe default when input is invalid: skip capture/evaluation and emit no output.
- Dependency/downstream failure behavior: checker download failure plus no `COMMENT_CHECKER_COMMAND` and no checker on `PATH` is a no-op; debug detail is emitted only when `HOOK_PACK_DEBUG=1`.
- Timeout behavior: dispatcher registry timeout is fail-closed; hook-owned resolver/download/runner timeouts are fail-open only as listed here and must be covered by tests.
- Path validation: all pending paths are canonicalized under the current workspace when available; download/extract writes stay under `${CLAUDE_PLUGIN_DATA}/comment-checker/bin` and reject absolute paths, parent traversal, links, and non-regular archive entries.
- Failure output shape: unavailable checker paths return no blocking decision; checker findings return `stopDecision: "block"`; unexpected hook errors fail open with no findings unless the dispatcher timeout terminates the hook.

### Tests required before implementation

- Red test names: pending call capture/evaluation, checker exit code mapping, lazy resolver fail-open behavior, plugin-data download path safety, and apply_patch parity only after Task 7 Step 0 evidence.
- Reference test ports: `tests/hooks/comment-checker.test.ts` (cross-port of `docs/reference/hooks/comment-checker/hook.apply-patch.test.ts` when runtime evidence permits and `docs/reference/hooks/comment-checker/hook.lazy-init.test.ts`), `tests/hooks/comment-checker-runner.test.ts` (port of `docs/reference/hooks/comment-checker/cli.test.ts`), `tests/hooks/comment-checker-pending-store.test.ts` (port of `docs/reference/hooks/comment-checker/pending-calls.test.ts`), `tests/hooks/comment-checker-downloader.test.ts` (new downloader safety coverage for `docs/reference/hooks/comment-checker/downloader.ts`).
- Edge cases: failed post-tool output, missing path, same-path concurrent edits, expired pending calls, unavailable command, downloader archive traversal, non-zero checker exits other than `2`, and inconclusive apply_patch metadata.
- Validator checks: record header, stable ID, portable decision, reference source, state/lifecycle, tests, and neutrality sections must exist before registry entry validation passes.

### Orchestration neutrality

- Reference-only identifiers removed or renamed: in-process runner lock and long-lived background initialization gate are not ported verbatim because command hooks run as new Node processes; shipped code must use generic hook IDs and plugin-data paths only.
- Shipped-source neutrality checks: implementation must not introduce `omo`, `sisyphus`, `opencode`, or `OPENCODE_*` identifiers in shipped source; docs/reference remains historical material only.

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work: Task 7 Step 0 must record compatible Claude runtime evidence before applying apply_patch parity; otherwise apply-patch cases remain dropped/non-portable.

## Migration Feasibility Record: directory-agents-injector

Stable ID: directory-agents-injector
Decision: portable
Reviewer:
Date: 2026-04-26

### Reference source

- Source paths consulted: `docs/reference/hooks/directory-agents-injector/finder.ts`, `docs/reference/hooks/directory-agents-injector/injector.ts`, `docs/reference/hooks/directory-agents-injector/storage.ts`, `docs/reference/hooks/directory-agents-injector/constants.ts`, `docs/reference/hooks/directory-agents-injector/injector.test.ts`.
- Original intent: discover nested `AGENTS.md` files upward from a successfully read file, inject root-nearest directory context once per session/path, and include a truncation notice when content is shortened.
- Original trigger: after a successful `Read` result for a file inside the current workspace.
- Missing reference source notes: shared `dynamic-truncator` source is absent, so Task 2 fallback truncation is used; `session-injected-paths` is represented as hook-owned plugin-data state rather than a shared source module.

### Claude Code runtime mapping

- Native events: `PostToolUse`, `PreCompact`, `SessionEnd`.
- Required hook input fields: `session_id`, `cwd`, tool name `Read`, original tool input path aliases, and post-tool success indicator.
- Expected hook output fields: `additionalContext` containing formatted `AGENTS.md` context fragments, or no output when no eligible file exists.
- Runtime timeout: registry timeout is fail-closed through the dispatcher; file scanning and truncation stay synchronous and bounded by workspace ancestry.

### State and lifecycle

- State location: `${CLAUDE_PLUGIN_DATA}/directory-agents-injector/session-injected-paths.json`.
- Cross-process safety: per-session dedupe state uses JSON temp-file rename under a mkdir lock.
- Lifecycle cleanup: `PreCompact` and `SessionEnd` delete session dedupe state so context can be re-injected after compaction and does not survive known session boundaries.
- Stale-state cleanup: normal execution opportunistically drops old session entries because lifecycle events are not guaranteed for every process exit.

### Security and failure behavior

- Safe default when input is invalid: emit no context.
- Dependency/downstream failure behavior: failed `Read` responses, missing path, non-file targets, unreadable `AGENTS.md`, or outside-cwd paths emit no context.
- Timeout behavior: dispatcher registry timeout is fail-closed; no hook-owned fail-open dependency timeout is needed beyond bounded filesystem traversal.
- Path validation: canonicalize target and ancestors; scan only from the target directory up to canonical cwd, with workspace-root skip only if Task 5 Step 0 proves Claude Code already loads root `AGENTS.md`.
- Failure output shape: no context on invalid, missing, failed, outside-cwd, or already-injected paths.

### Tests required before implementation

- Red test names: upward discovery order, root handling, per-session dedupe, failed-read no-op, outside-cwd no-op, lifecycle cleanup reinjection, and truncation notice.
- Reference test ports: `tests/hooks/directory-agents-injector.test.ts` (port of `docs/reference/hooks/directory-agents-injector/injector.test.ts`).
- Edge cases: duplicate reads in one session, different sessions, symlink/canonical paths, missing path aliases, large files, root `AGENTS.md` evidence branch, and lifecycle event cleanup.
- Validator checks: record header, stable ID, portable decision, reference source, state/lifecycle, tests, and neutrality sections must exist before registry entry validation passes.

### Orchestration neutrality

- Reference-only identifiers removed or renamed: any reference storage names are replaced with hook-owned `directory-agents-injector` state names.
- Shipped-source neutrality checks: implementation must not introduce `omo`, `sisyphus`, `opencode`, or `OPENCODE_*` identifiers in shipped source; docs/reference remains historical material only.

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work: Task 5 Step 0 must supply evidence for root `AGENTS.md` skip; default fallback is to inject root context when evidence is inconclusive.

## Migration Feasibility Record: directory-readme-injector

Stable ID: directory-readme-injector
Decision: portable
Reviewer:
Date: 2026-04-26

### Reference source

- Source paths consulted: `docs/reference/hooks/directory-readme-injector/finder.ts`, `docs/reference/hooks/directory-readme-injector/injector.ts`, `docs/reference/hooks/directory-readme-injector/storage.ts`, `docs/reference/hooks/directory-readme-injector/constants.ts`, `docs/reference/hooks/directory-readme-injector/injector.test.ts`.
- Original intent: discover `README.md` files upward from a successfully read file, include root README context, inject root-nearest directory context once per session/path, and include a truncation notice when content is shortened.
- Original trigger: after a successful `Read` result for a file inside the current workspace.
- Missing reference source notes: shared `dynamic-truncator` source is absent, so Task 2 fallback truncation is used; `session-injected-paths` is represented as hook-owned plugin-data state rather than a shared source module.

### Claude Code runtime mapping

- Native events: `PostToolUse`, `PreCompact`, `SessionEnd`.
- Required hook input fields: `session_id`, `cwd`, tool name `Read`, original tool input path aliases, and post-tool success indicator.
- Expected hook output fields: `additionalContext` containing formatted `README.md` context fragments, or no output when no eligible file exists.
- Runtime timeout: registry timeout is fail-closed through the dispatcher; file scanning and truncation stay synchronous and bounded by workspace ancestry.

### State and lifecycle

- State location: `${CLAUDE_PLUGIN_DATA}/directory-readme-injector/session-injected-paths.json`.
- Cross-process safety: per-session dedupe state uses JSON temp-file rename under a mkdir lock.
- Lifecycle cleanup: `PreCompact` and `SessionEnd` delete session dedupe state so context can be re-injected after compaction and does not survive known session boundaries.
- Stale-state cleanup: normal execution opportunistically drops old session entries because lifecycle events are not guaranteed for every process exit.

### Security and failure behavior

- Safe default when input is invalid: emit no context.
- Dependency/downstream failure behavior: failed `Read` responses, missing path, non-file targets, unreadable `README.md`, or outside-cwd paths emit no context.
- Timeout behavior: dispatcher registry timeout is fail-closed; no hook-owned fail-open dependency timeout is needed beyond bounded filesystem traversal.
- Path validation: canonicalize target and ancestors; scan only from the target directory up to canonical cwd and include cwd-root `README.md` when present.
- Failure output shape: no context on invalid, missing, failed, outside-cwd, or already-injected paths.

### Tests required before implementation

- Red test names: upward discovery order, root include, per-session dedupe, failed-read no-op, outside-cwd no-op, lifecycle cleanup reinjection, and truncation notice.
- Reference test ports: `tests/hooks/directory-readme-injector.test.ts` (port of `docs/reference/hooks/directory-readme-injector/injector.test.ts`).
- Edge cases: duplicate reads in one session, different sessions, symlink/canonical paths, missing path aliases, large files, root README inclusion, and lifecycle event cleanup.
- Validator checks: record header, stable ID, portable decision, reference source, state/lifecycle, tests, and neutrality sections must exist before registry entry validation passes.

### Orchestration neutrality

- Reference-only identifiers removed or renamed: any reference storage names are replaced with hook-owned `directory-readme-injector` state names.
- Shipped-source neutrality checks: implementation must not introduce `omo`, `sisyphus`, `opencode`, or `OPENCODE_*` identifiers in shipped source; docs/reference remains historical material only.

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work: none before implementation beyond red tests.

## Migration Feasibility Record: rules-injector

Stable ID: rules-injector
Decision: portable
Reviewer:
Date: 2026-04-26

### Reference source

- Source paths consulted: `docs/reference/hooks/rules-injector/hook.ts`, `docs/reference/hooks/rules-injector/injector.ts`, `docs/reference/hooks/rules-injector/finder.ts`, `docs/reference/hooks/rules-injector/rule-file-finder.ts`, `docs/reference/hooks/rules-injector/rule-file-scanner.ts`, `docs/reference/hooks/rules-injector/project-root-finder.ts`, `docs/reference/hooks/rules-injector/rule-distance.ts`, `docs/reference/hooks/rules-injector/parser.ts`, `docs/reference/hooks/rules-injector/matcher.ts`, `docs/reference/hooks/rules-injector/output-path.ts`, `docs/reference/hooks/rules-injector/cache.ts`, `docs/reference/hooks/rules-injector/rule-scan-cache.ts`, `docs/reference/hooks/rules-injector/storage.ts`, `docs/reference/hooks/rules-injector/constants.ts`, `docs/reference/hooks/rules-injector/types.ts`, `docs/reference/hooks/rules-injector/index.ts`, and all sibling tests.
- Original intent: discover rule files near a target path, parse frontmatter, match scopes with reference matcher semantics, dedupe by realpath/content hash, and inject matching rules once per session.
- Original trigger: after successful file read/write/edit-style tool results for tracked tools.
- Missing reference source notes: shared `dynamic-truncator` source is absent and Task 2 fallback truncation is used; `EXCLUDED_DIRS`, `logger`, and `plugin-identity` imports are converted to local constants, debug-gated messages, or stable hook IDs; absent shared scan state is stored under plugin data.

### Claude Code runtime mapping

- Native events: `PostToolUse`, `PreCompact`, `SessionEnd`.
- Required hook input fields: `session_id`, `cwd`, tool name, original tool input path aliases, post-tool success indicator, and plugin user config fields `include_user_rules` and `max_context_chars`.
- Expected hook output fields: `additionalContext` containing formatted matching rule content, or no output when no matching rule exists.
- Runtime timeout: registry timeout is fail-closed through the dispatcher; scanning, parsing, and matching use bounded ancestry and cache lookups.

### State and lifecycle

- State location: `${CLAUDE_PLUGIN_DATA}/rules-injector/session-injected-paths.json`, `${CLAUDE_PLUGIN_DATA}/rules-injector/parsed-cache`, and scan-cache files under `${CLAUDE_PLUGIN_DATA}/rules-injector`.
- Cross-process safety: dedupe, scan cache, and parsed-rule cache use temp-file rename with mkdir locks; parsed cache keys include realpath and mtime/content hash metadata.
- Lifecycle cleanup: `PreCompact` and `SessionEnd` clear session dedupe and scan-cache entries so rules can be re-injected after compaction and stale scan results do not survive known session boundaries.
- Stale-state cleanup: normal execution prunes old session entries, ignores stale parsed-cache entries when mtime/hash changes, persists parsed-rule cache under `${CLAUDE_PLUGIN_DATA}/rules-injector/parsed-cache`, and uses deterministic same-distance tie ordering.

### Security and failure behavior

- Safe default when input is invalid: emit no context.
- Dependency/downstream failure behavior: malformed frontmatter and scan errors skip the offending rule and continue with remaining rules; when no project marker exists inside cwd, canonical cwd is used as project root instead of disabling rules.
- Timeout behavior: dispatcher registry timeout is fail-closed; no hook-owned fail-open dependency timeout is allowed unless later tests explicitly add one.
- Path validation: canonicalize target path, constrain project rule discovery to canonical cwd/project root, and require user-home rules to be explicitly enabled with `include_user_rules: true`.
- Failure output shape: no context on invalid, failed, outside-cwd, already-injected, or no-match paths; partial valid rule matches still emit context when other rules fail to parse.

### Tests required before implementation

- Red test names: tracked tool selection, proximity discovery, same-distance ties, project-root marker boundary, parser behavior, scope matching, realpath/content-hash dedupe, parsed cache invalidation, malformed frontmatter skip, user-home opt-in, and lifecycle cleanup.
- Reference test ports: `tests/hooks/rules-injector.test.ts` (port of `docs/reference/hooks/rules-injector/injector.test.ts`), `tests/hooks/rules-injector-finder.test.ts` (port of `docs/reference/hooks/rules-injector/finder.test.ts`), `tests/hooks/rules-injector-cache.test.ts` (port of `docs/reference/hooks/rules-injector/cache.test.ts`), `tests/hooks/rules-injector-output-path.test.ts` (port of `docs/reference/hooks/rules-injector/output-path.test.ts`), `tests/hooks/rules-injector-project-root.test.ts` (port of `docs/reference/hooks/rules-injector/project-root-finder.test.ts`), `tests/hooks/rules-injector-rule-file-scanner.test.ts` (port of `docs/reference/hooks/rules-injector/rule-file-scanner.test.ts`), `tests/hooks/rules-injector-rule-scan-cache.test.ts` (port of `docs/reference/hooks/rules-injector/rule-scan-cache.test.ts`), `tests/hooks/rules-injector-storage.test.ts` (port of `docs/reference/hooks/rules-injector/storage.test.ts`), `tests/hooks/rules-injector-parser.test.ts` (port of `docs/reference/hooks/rules-injector/parser.test.ts` from Task 2).
- Edge cases: malformed frontmatter, scan permission errors, no marker inside cwd, omitted `.venv` marker behavior, same-distance ties, duplicate realpaths, changed content hash, disabled user-home rules, enabled user-home rules, and cache cleanup on lifecycle events.
- Validator checks: record header, stable ID, portable decision, reference source, state/lifecycle, tests, and neutrality sections must exist before registry entry validation passes.

### Orchestration neutrality

- Reference-only identifiers removed or renamed: remove `.sisyphus/rules` and `.opencode/rules` rule directories, drop `OPENCODE_STORAGE` and other `OPENCODE_*` constants, remove `.venv` as a project marker if implementation omits it, make user-home rules opt-in, persist parsed-rule cache under plugin data, and keep deterministic same-distance tie ordering.
- Shipped-source neutrality checks: implementation must not introduce `omo`, `sisyphus`, `opencode`, or `OPENCODE_*` identifiers in shipped source; docs/reference remains historical material only.

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work: implementation tests must document every intentional change from reference behavior before registry entry lands.

## Migration Feasibility Record: write-existing-file-guard

Stable ID: write-existing-file-guard
Decision: portable
Reviewer:
Date: 2026-04-26

### Reference source

- Source paths consulted: `docs/reference/hooks/write-existing-file-guard/hook.ts`, `docs/reference/hooks/write-existing-file-guard/tool-execute-before-handler.ts`, `docs/reference/hooks/write-existing-file-guard/session-read-permissions.ts`, `docs/reference/hooks/write-existing-file-guard/index.test.ts`, `docs/reference/hooks/write-existing-file-guard/lazy-canonical-path-init.test.ts`.
- Original intent: block unsafe writes to existing in-workspace files until the file has been successfully read in the same session, allow one-shot read permission, canonicalize path aliases, strip overwrite bypass field from allowed writes, and preserve LRU trimming.
- Original trigger: record successful `Read` in post-tool handling; enforce overwrite policy before `Write` executes.
- Missing reference source notes: storage moves to canonical plugin data; path aliases and lazy canonical path handling are preserved through shared path helpers and hook-owned token storage.

### Claude Code runtime mapping

- Native events: `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd`.
- Required hook input fields: `session_id`, `cwd`, tool name, `Write` input path aliases, `overwrite` flag, successful `Read` path aliases, and plugin data directory.
- Expected hook output fields: `permissionDecision: "deny"` with verbatim reason for unsafe existing writes; `permissionDecision: "allow"` with `updatedInput` when stripping allowed `overwrite`; no output for allowed default paths.
- Runtime timeout: registry timeout is fail-closed through the dispatcher; token-store locks must complete within registry timeout and must deny by default on token-store failure for existing in-cwd writes.

### State and lifecycle

- State location: `${CLAUDE_PLUGIN_DATA}/write-existing-file-guard/read-tokens` plus metadata preserving LRU limits of `256` sessions and `1024` paths per session.
- Cross-process safety: token files use mkdir path locks; `PreToolUse Write` atomically consumes a matching token and invalidates other sessions under one lock.
- Lifecycle cleanup: `PreCompact` and `SessionEnd` remove read tokens for the session so stale read permissions do not survive known session boundaries.
- Stale-state cleanup: normal execution prunes LRU metadata, clears stale locks, denies stale read-token fingerprint mismatches, and invalidates tokens when file fingerprints change.

### Security and failure behavior

- Safe default when input is invalid: deny existing in-cwd writes unless a safe allow rule applies.
- Dependency/downstream failure behavior: missing plugin data or token-store failure denies existing in-cwd writes by default with verbatim block message `"File already exists. Use edit tool instead."`; successful `PostToolUse Read` is the only read-token authorizer.
- Timeout behavior: dispatcher registry timeout is fail-closed; no hook-owned fail-open timeout is allowed for overwrite enforcement.
- Path validation: allow non-existing files, outside-cwd paths, canonical `${CLAUDE_PLUGIN_DATA}` paths, explicit `overwrite: true` or `"true"`, and same-session consumed read tokens whose stored canonical path fingerprint still matches current file state.
- Failure output shape: unsafe writes return `permissionDecision: "deny"` and reason `"File already exists. Use edit tool instead."`; allowed overwrite returns `permissionDecision: "allow"` plus original input with only `overwrite` removed.

### Tests required before implementation

- Red test names: block existing write without read, allow new files, allow outside-cwd, allow plugin-data paths, allow and strip overwrite, record successful reads only, consume read token once, invalidate stale fingerprint, cross-session invalidation, LRU trimming, lifecycle cleanup, missing plugin data deny, and token-store failure deny.
- Reference test ports: `tests/hooks/write-existing-file-guard.test.ts` (port of `docs/reference/hooks/write-existing-file-guard/index.test.ts`), `tests/hooks/write-existing-file-guard-token-store.test.ts` (new token-store coverage for `docs/reference/hooks/write-existing-file-guard/session-read-permissions.ts`), `tests/hooks/write-existing-file-guard-cross-process.test.ts` (new spawned-child concurrency coverage for atomic consume/invalidate behavior).
- Edge cases: path aliases, canonical symlink paths, changed files after read, concurrent sessions, stale locks, overwrite string/boolean handling, failed reads, missing cwd, missing plugin data, and LRU limits.
- Validator checks: record header, stable ID, portable decision, reference source, state/lifecycle, tests, and neutrality sections must exist before registry entry validation passes.

### Orchestration neutrality

- Reference-only identifiers removed or renamed: drop `OPENCODE_STORAGE` and all `OPENCODE_*` constants, remove `.sisyphus/**` bypass entirely, and rely only on canonical `${CLAUDE_PLUGIN_DATA}` and outside-cwd bypasses.
- Shipped-source neutrality checks: implementation must not introduce `omo`, `sisyphus`, `opencode`, or `OPENCODE_*` identifiers in shipped source; docs/reference remains historical material only.

### Gate result

- May enter BUILT_IN_REGISTRY: yes
- Follow-up work: behavior tests must preserve the exact reference block message before registry entry lands.
