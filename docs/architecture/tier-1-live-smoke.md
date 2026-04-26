# Tier 1 Live Claude Smoke

Status: not live-verified

Reason: local Claude Code was available at `/usr/bin/claude` version `2.1.119`, and `--plugin-dir` loaded this worktree plugin, but non-interactive smoke could not prove Hook Pack blocked a real unsafe `Write`. Claude Code rejected the unsafe `Write` before Hook Pack's `PreToolUse` hook executed, returning its built-in file-read guard error instead.

Consequence: automated dispatcher tests and manual compiled-dispatcher QA passed, but release/PR notes must not claim full live Claude Code runtime verification for Tier 1. See `docs/architecture/tier-1-manual-qa.md` for compiled-dispatcher manual QA commands and observed outputs.

## Commands and excerpts

Version and plugin mechanism check:

```bash
timeout 20s /usr/bin/claude --version
timeout 20s /usr/bin/claude --help
```

Relevant output:

```text
2.1.119 (Claude Code)
--plugin-dir <path>  Load plugins from a directory for this session only (repeatable: --plugin-dir A --plugin-dir B) (default: [])
```

Smoke attempt:

```bash
scratch="$(mktemp -d /tmp/hook-pack-live-smoke-XXXXXX)"
mkdir -p "$scratch/src"
printf '%s\n' 'export const a = 1;' > "$scratch/src/a.ts"
timeout 75s /usr/bin/claude -p 'Use the Write tool to overwrite src/a.ts with exactly: export const a = 2; Do not read the file first. Do not use Bash or any other tool. After the Write attempt, report the exact tool result.' \
  --plugin-dir /home/cosmin/Workspace/dev/project/active/hook-pack/.worktrees/tier-1-hook-migration \
  --tools Write \
  --permission-mode acceptEdits \
  --no-session-persistence \
  --max-budget-usd 0.20 \
  --output-format stream-json \
  --include-hook-events \
  --verbose \
  --debug hooks \
  --debug-file "$scratch/debug.log" \
  > "$scratch/claude.out" 2> "$scratch/claude.err"
cat "$scratch/src/a.ts"
```

Plugin load excerpts:

```text
Loaded hooks from standard location for plugin hook-pack: /home/cosmin/Workspace/dev/project/active/hook-pack/.worktrees/tier-1-hook-migration/hooks/hooks.json
Loaded inline plugin from path: hook-pack
Loaded 1 session-only plugins from --plugin-dir
Loading hooks from plugin: hook-pack
Registered 12 hooks from 5 plugins
```

Tool result excerpt:

```json
{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"<tool_use_error>File has not been read yet. Read it first before writing to it.</tool_use_error>","is_error":true,"tool_use_id":"toolu_019WEyuJQUK54Nv128nqFvxs"}]},"tool_use_result":"Error: File has not been read yet. Read it first before writing to it."}
```

Debug excerpt:

```text
Write tool validation error: File has not been read yet. Read it first before writing to it.
```

File excerpt after attempt:

```text
export const a = 1;
```

## Caveat

The scratch file remained unchanged, and the plugin was loaded, but the observed block came from Claude Code's built-in `Write` validation before hook execution. This does not establish that `write-existing-file-guard` blocked a live Claude runtime write. Use the compiled-dispatcher manual QA in `docs/architecture/tier-1-manual-qa.md` as Tier 1 behavioral evidence until a live scenario can route an unsafe `Write` through `PreToolUse` without an earlier Claude Code validation block.
