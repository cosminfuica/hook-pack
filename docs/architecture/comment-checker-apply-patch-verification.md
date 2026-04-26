# Comment Checker apply_patch Verification

## Status

Status: inconclusive
Decision: dropped/non-portable for Tier 1
Date: 2026-04-26

## Goal

Task 7 required a local Claude Code runtime experiment before porting any `apply_patch` comment-checker behavior. The portable contract needed both a compatible tool name and `tool_response.metadata.files` entries with before/after content. Without that runtime metadata evidence, Task 7 must omit `apply_patch` from implementation, types, and executable tests.

The `docs/reference/hooks/comment-checker/*` files named in the migration plan are present and were consulted. The shipped Tier 1 implementation ports/adapts the portable reference contracts, while `apply_patch` remains dropped because the local runtime experiment did not establish a portable Claude Code metadata contract.

## Environment

- CLI path: `/usr/bin/claude`
- Version command: `timeout 20s /usr/bin/claude --version`
- Observed version output: `2.1.119 (Claude Code)`
- Scratch workspace: temporary directory created with `mktemp -d`, removed after each attempt
- Hook Pack plugin: not installed or enabled for the experiment

## Commands and observed output

### Attempt 1

Command excerpt:

```bash
timeout 20s /usr/bin/claude --version && \
tmpdir=$(mktemp -d) && \
printf 'alpha\nneedle\nomega\n' > "$tmpdir/target.txt" && \
printf 'Scratch: %s\n' "$tmpdir" && \
timeout 90s /usr/bin/claude --debug -p 'In this scratch directory, change target.txt line needle to changed using any available patch/edit tool. Return only brief done.' < /dev/null 2>&1
```

Observed output excerpt:

```text
2.1.119 (Claude Code)
Scratch: /tmp/tmp.qP3U37RWu4
No target.txt found. No scratch dir present.

CLAUDE_EXIT=0
FILE_CONTENTS:
alpha
needle
omega
```

Result: no file edit occurred because the prompt did not provide the scratch path. No hook event metadata was exposed.

### Attempt 2

Command excerpt:

```bash
tmpdir=$(mktemp -d) && \
printf 'alpha\nneedle\nomega\n' > "$tmpdir/target.txt" && \
printf 'Scratch: %s\n' "$tmpdir" && \
prompt="Edit the file at $tmpdir/target.txt by changing the line needle to changed. Use any available patch or edit tool. Return only done." && \
timeout 90s /usr/bin/claude --debug -p "$prompt" < /dev/null 2>&1
```

Observed output excerpt:

```text
Scratch: /tmp/tmp.GFI12n70hz
done

CLAUDE_EXIT=0
FILE_CONTENTS:
alpha
changed
omega
```

Result: Claude Code edited the scratch file successfully, but the non-interactive debug output did not expose a portable `tool_name` nor `tool_response.metadata.files` shape.

## Decision

The local runtime experiment did not prove the metadata contract required by Task 7. External documentation found no portable Claude Code guarantee for `apply_patch` metadata with before/after file content. Therefore Task 7 intentionally omits `apply_patch` from the comment-checker pending type union, hook implementation, and executable runtime behavior. The reference apply-patch behavior remains historical evidence only and is not claimed as portable for Tier 1.
