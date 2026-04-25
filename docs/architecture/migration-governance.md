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
## Migration Feasibility Record: <candidate-name>

Stable ID: <future-hook-id-or-none>
Decision: portable | redesign-needed | not-portable
Reviewer:
Date:

### Reference source

- Source path or notes:
- Original intent:
- Original trigger:

### Claude Code runtime mapping

- Native event:
- Required hook input fields:
- Expected hook output fields:
- Runtime timeout:

### Portability check

- Uses ${CLAUDE_PLUGIN_ROOT} for shipped plugin files:
- Uses ${CLAUDE_PLUGIN_DATA} for runtime state:
- Avoids absolute maintainer paths:
- Avoids secrets and credential material:
- Avoids OpenCode-only APIs:

### Security and failure behavior

- Safe default when input is invalid:
- Secret handling:
- Path validation:
- Failure output shape:

### Tests required before implementation

- Red test name:
- Edge cases:
- Validator checks:

### Gate result

- May enter BUILT_IN_REGISTRY: yes | no
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

No migrated hook has passed this gate yet. The runtime registry stays empty until a task adds a completed record and tested implementation.
