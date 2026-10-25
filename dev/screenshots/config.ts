import { resolve } from "path";

import type { ExtStoreConfig } from "@ajgeel/ext-store";
import { runTask } from "@ajgeel/ext-store/ui";
import { DIST_DIR } from "@ajgeel/ext-store/utils";

import { NOW, TIME_ZONE } from "./fixtures";
import { scenes } from "./scenes";

type Screenshots = NonNullable<ExtStoreConfig["screenshots"]>;

// Its own folder, so a release build in dist/chromium is never replaced.
const extensionDir = resolve(DIST_DIR, "screenshots/extension");

export const screenshots: Screenshots = {
  extensionDir,
  page: "src/pages/history/index.html",
  // The dev build shows generated visits, as a fresh browser has no history.
  setup: async () => {
    await runTask(
      "Building the Chrome extension",
      ["bunx", "vite", "build", "--outDir", extensionDir, "--emptyOutDir"],
      { BUILD_TARGET: "chrome", __DEV__: "true" },
    );
  },
  ready: async (page) => {
    await page.getByRole("heading", { name: /^Today/ }).waitFor();
    await page.getByText("MDR-1").first().waitFor();
  },
  now: NOW,
  locale: "en-GB",
  timezoneId: TIME_ZONE,
  frame: {
    template: "dev/screenshots/frame.html",
    icon: "public/icon-128.png",
    accent: "#6c3be8",
    ink: "#15161c",
  },
  scenes: scenes.map(
    ({ id, headline, suggestions, dark, backdrop, setup }) => ({
      id,
      headline,
      backdrop: `dev/screenshots/backdrops/${backdrop}.svg`,
      prepare: async ({ worker }) => {
        await worker.evaluate(
          (shown) =>
            (
              globalThis as unknown as {
                chrome: {
                  storage: { local: { set: (items: object) => Promise<void> } };
                };
              }
            ).chrome.storage.local.set({ suggestionsShown: shown }),
          suggestions,
        );
      },
      setup: async (page, stage) => {
        await stage("setting the theme", () =>
          page.emulateMedia({ colorScheme: dark ? "dark" : "light" }),
        );
        await setup?.(page);
      },
    }),
  ),
};
