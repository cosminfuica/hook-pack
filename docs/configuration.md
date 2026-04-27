# Configuration

User-facing reference for the hooks Hook Pack ships and how to configure them. The set of bundled hooks evolves between releases — see `BUILT_IN_REGISTRY` in `src/core/registry.ts` for the authoritative list.

## Hooks shipped today

| Hook ID | Native events | Purpose |
| --- | --- | --- |
| `comment-checker` | `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd` | Detects unnecessary comments after write/edit-style tools when a checker command or downloaded binary is available; findings block continuation so the agent fixes them. |
| `directory-agents-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | Injects nested `AGENTS.md` context after successful `Read` results. |
| `directory-readme-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | Injects relevant `README.md` context after successful `Read` results. |
| `rules-injector` | `PostToolUse`, `PreCompact`, `SessionEnd` | Injects matching project rule files (`.github/instructions`, `.cursor/rules`, `.claude/rules`) after successful file read/write/edit tools. |
| `write-existing-file-guard` | `PreToolUse`, `PostToolUse`, `PreCompact`, `SessionEnd` | Blocks unsafe `Write` overwrites until the file has been read successfully in the same session. |

All five default to enabled.

## User config fields

Set through Claude Code's plugin options or `.claude/hook-pack.local.md`.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled_hooks` | comma-separated string | empty | Hook IDs to enable beyond defaults. |
| `disabled_hooks` | comma-separated string | empty | Hook IDs to disable. Always wins over enable. |
| `enable_all_hooks_by_default` | boolean | `false` | When `true`, every shipped hook defaults to enabled unless listed in `disabled_hooks`. |
| `max_context_chars` | number | `20000` | Fallback truncation limit when no model context window is detected. |
| `include_user_rules` | boolean | `false` | When `true`, `rules-injector` also scans `~/.claude/rules`, `~/.cursor/rules`, `~/.github/instructions`. |

## Project-local override

Create `.claude/hook-pack.local.md` (gitignored) with YAML frontmatter:

```markdown
---
disabled_hooks: write-existing-file-guard
include_user_rules: true
max_context_chars: 30000
---
```

Do not store secrets here. Hook Pack only reads hook selection and context limits from this file.

## Lifecycle cleanup

Per-session state (read tokens, dedupe caches, pending checker calls) is cleared on `PreCompact` and `SessionEnd`. Each stateful hook also runs opportunistic stale-state cleanup during normal hook execution because Claude Code does not guarantee `SessionEnd` delivery for every termination mode.

Runtime state lives only under `${CLAUDE_PLUGIN_DATA}` — never under source dirs, `dist`, `hooks`, `docs`, `$HOME`, `/tmp`, or arbitrary cache paths.
