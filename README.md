# Hook Pack

Native Claude Code hook plugin.

## Install

In Claude Code:

```
/plugin marketplace add cosminfuica/hook-pack
/plugin install hook-pack@cosminfuica
```

Restart Claude Code, then `/hooks` to confirm. Hooks are enabled by default.

See [`docs/configuration.md`](docs/configuration.md) for the hook list and configuration options.

## Contributing

Requires Node 20+.

```bash
npm install
npm run build         # tsc + esbuild bundle
npm run typecheck
npm test
npm run validate:plugin
```

All four must pass before opening a PR. After any source change touching runtime code, **rebuild and commit `dist/hook-pack-dispatch.mjs`** so `/plugin install` keeps working from a fresh clone.

See [`docs/architecture/`](docs/architecture/) for runtime architecture, migration governance, and verification evidence.
