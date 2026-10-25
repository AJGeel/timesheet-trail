# Timesheet Trail

A better browser history search for Chrome and Firefox, for time tracking.

Set up like [UpTab](../uptab): Vite, React and TypeScript, built for both browsers from one codebase.

## Development

You need [Bun](https://bun.sh/).

```sh
bun install
bun dev          # Firefox: rebuilds dist/firefox on change and opens a temporary window
bunx nodemon     # Chrome: rebuilds dist/chromium on change
```

For Chrome, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select `dist/chromium`. Reload the extension after a change.

```sh
bun run typecheck
bun run build        # dist/chromium and dist/firefox
bun ship             # builds and zips both, as submitted to the stores
bun lint:firefox     # web-ext lint on the Firefox build
```

The manifest is `src/manifest.ts`. Pages live in `src/pages/` and must also be added to `build.rollupOptions.input` in `vite.config.ts`.

## Releasing

See [docs/releasing.md](docs/releasing.md).
