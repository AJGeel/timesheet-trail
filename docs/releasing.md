# Releasing

Timesheet Trail is submitted to the Chrome Web Store and Firefox Add-ons with one script:

```sh
bun store:status            # versions live and pending in each store
bun store:submit --dry-run  # all checks and a build, without uploading
bun store:submit            # build and submit to both stores
bun store:submit firefox    # or only one store: chrome / firefox
```

`store:submit` stops before uploading anything if there are uncommitted changes, a store already has the `version` from `package.json` (live or in review), or a built manifest has the wrong version or is meant for the other browser.

## Release checklist

1. Bump `version` in `package.json`.
2. Add the release to `CHANGELOG.md` as `## [V<version>] — <date>`.
3. Commit, then run `bun store:submit --dry-run`.
4. Run `bun store:submit`.
5. Check `bun store:status` in the following days.
6. Once merged, on an up-to-date `main`, run `bun tag-release` (`--dry-run` previews it).

## First submission (manual)

Neither store's API can create a listing, so the first version is uploaded by hand.

- **Chrome:** upload `dist/chromium.zip` (from `bun ship`) in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/), fill in the listing, and copy the new item ID to `CHROME_EXTENSION_ID`.
- **Firefox:** submit `dist/firefox.zip` at [addons.mozilla.org/developers](https://addons.mozilla.org/en-US/developers/addon/submit/distribution) as **listed**. The add-on ID is `gecko.id` in `src/manifest.ts`, and must match `FIREFOX_EXTENSION_ID`. AMO also asks for the source code: upload `git archive --format=zip -o dist/source.zip HEAD`.

After that, `bun store:submit` handles every update.

## Credentials

Copy `.env.example` to `.env` and fill it in.

### Chrome Web Store

Uses the [Chrome Web Store API V2](https://developer.chrome.com/docs/webstore/api) with an OAuth refresh token.

1. In the [Google Cloud Console](https://console.cloud.google.com/), create or select a project and enable the **Chrome Web Store API**.
2. Under **Google Auth Platform**, set up the consent screen with user type **External**, then under **Audience** click **Publish app**. While it's in **Testing**, refresh tokens expire after 7 days.
3. Under **Clients**, create an OAuth client of type **Desktop app**, and copy its ID and secret to `CHROME_CLIENT_ID` and `CHROME_CLIENT_SECRET`.
4. Run `bun store:auth` and sign in with the account that owns the listing. Google warns the app isn't verified: choose **Advanced > Go to (app name)**. The refresh token is saved to `.env`.
5. In the Developer Dashboard, go to **Publisher > Settings** and copy the publisher ID to `CHROME_PUBLISHER_ID`.

Check it with `bun store:status chrome`.

### Firefox Add-ons

Uses [`web-ext sign`](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign) to submit a listed version, with the committed source (`git archive HEAD`) attached.

Generate API credentials at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/en-US/developers/addon/api/key/) and put them in `FIREFOX_JWT_ISSUER` and `FIREFOX_JWT_SECRET`. Check with `bun store:status firefox`.
