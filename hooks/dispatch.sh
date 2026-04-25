#!/usr/bin/env bash
set -euo pipefail

EVENT_NAME="${1:-}"

if [[ -z "${EVENT_NAME}" ]]; then
  printf '%s\n' "hook-pack dispatch error: missing Claude Code hook event name" >&2
  exit 1
fi

if [[ -z "${CLAUDE_PLUGIN_ROOT:-}" ]]; then
  printf '%s\n' "hook-pack dispatch error: CLAUDE_PLUGIN_ROOT is not set" >&2
  exit 1
fi

exec node "${CLAUDE_PLUGIN_ROOT}/dist/src/cli/dispatch.js" "${EVENT_NAME}"
