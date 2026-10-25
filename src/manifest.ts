import type { Manifest } from "webextension-polyfill";

import { buildTargets } from "../buildTarget.ts";
import pkg from "../package.json" with { type: "json" };

const isFirefox = process.env.BUILD_TARGET === buildTargets.firefox;

const pages = {
  background: "src/pages/background/index.js",
  history: "src/pages/history/index.html",
  popup: "src/pages/popup/index.html",
};

const manifest: Manifest.WebExtensionManifest = {
  action: {
    default_icon: "icon-34.png",
    default_popup: pages.popup,
  },
  background: isFirefox
    ? { scripts: [pages.background], type: "module" }
    : { service_worker: pages.background, type: "module" },
  commands: {
    // Firefox reserves Cmd/Ctrl+Y for its own history, so there the shortcut
    // may need to be set in about:addons. Chrome swaps its history page below.
    "open-history": {
      description: "Open the history",
      suggested_key: { default: "Ctrl+Y", mac: "Command+Y" },
    },
  },
  ...(isFirefox
    ? {}
    : {
        // The polyfill types predate the `history` key.
        chrome_url_overrides: {
          history: pages.history,
        } as Manifest.WebExtensionManifestChromeUrlOverridesType,
      }),
  description: pkg.description,
  icons: {
    "128": "icon-128.png",
  },
  manifest_version: 3,
  name: "Timesheet Trail",
  // `favicon` is Chrome's local favicon cache; Firefox has no such API.
  permissions: isFirefox ? ["history"] : ["history", "favicon"],
  version: pkg.version,
  ...(isFirefox
    ? {
        browser_specific_settings: {
          gecko: {
            id: "timesheet-trail@enrise.com",
            strict_min_version: "142.0",
            // Required by AMO for new add-ons: this one sends nothing anywhere.
            data_collection_permissions: { required: ["none"] },
          },
        },
      }
    : {}),
};

export default manifest;
