# Claude Code Root AGENTS.md Verification

## Goal

Decide whether Hook Pack should inject a workspace-root `AGENTS.md` from `directory-agents-injector`, or skip it because Claude Code already loads root `AGENTS.md` natively.

## Procedure attempted

A bounded local experiment used the installed Claude Code CLI at `/usr/bin/claude`. The probe created a temporary workspace root containing a sentinel-only `AGENTS.md`, then invoked Claude Code in non-interactive print mode with no tools and asked it to report whether that sentinel was present in loaded context.

## Commands run

```bash
/usr/bin/claude --help
```

Relevant output snippet:

```text
Usage: claude [options] [command] [prompt]
Claude Code - starts an interactive session by default, use -p/--print for
non-interactive output
...
-p, --print  Print response and exit (useful for pipes).
```

First sentinel attempt:

```bash
probe_dir=$(mktemp -d) && printf 'ROOT_AGENTS_SENTINEL_TASK5_8f6c2e9a\n' > "$probe_dir/AGENTS.md" && /usr/bin/claude -p 'If root AGENTS.md content is present in your loaded context, print only ROOT_AGENTS_SENTINEL_TASK5_8f6c2e9a. Otherwise print only MISSING_ROOT_AGENTS.' --tools '' --no-session-persistence --max-budget-usd 0.01 --output-format text; status=$?; rm -rf "$probe_dir"; exit $status
```

Output snippet:

```text
Error: Exceeded USD budget (0.01)
```

Second sentinel attempt from the temporary workspace:

```bash
probe_dir=$(mktemp -d); printf 'ROOT_AGENTS_SENTINEL_TASK5_8f6c2e9a\n' > "$probe_dir/AGENTS.md"; cd "$probe_dir" && /usr/bin/claude -p 'If root AGENTS.md content is present in your loaded context, print only ROOT_AGENTS_SENTINEL_TASK5_8f6c2e9a. Otherwise print only MISSING_ROOT_AGENTS.' --tools '' --no-session-persistence --max-budget-usd 0.10 --output-format text; status=$?; rm -rf "$probe_dir"; exit $status
```

Output snippet:

```text
MISSING_ROOT_AGENTS
```

## Decision

`inject-root`

## Rationale

The non-interactive sentinel probe completed and did not show the root `AGENTS.md` sentinel in Claude Code's loaded context. This means the migration has no reliable evidence that root `AGENTS.md` is automatically available to the model in the runtime mode this hook pack can exercise. The safe default is therefore to inject root `AGENTS.md` like any other ancestor by passing `includeRoot: true` for `directory-agents-injector`.
