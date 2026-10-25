<div align="center">
<img src="docs/images/banner.svg" alt="Timesheet Trail: a better browser history, for time tracking."/>
</div>

A better browser history for Chrome and Firefox, for time tracking.

## What it does

Browse your history day by day and hour by hour, and search it by title or URL. Timesheet Trail also turns your visits into time slots and matches each to the ticket (such as `MDR-142`) found in the pages you browsed: Jira, Confluence, GitLab, GitHub and more. Everything runs locally, and your history is never sent anywhere ([privacy policy](PRIVACY.md)).

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
