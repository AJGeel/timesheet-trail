import type { Manifest } from "webextension-polyfill";

import { buildTargets } from "../buildTarget.ts";
import pkg from "../package.json" with { type: "json" };

const isFirefox = process.env.BUILD_TARGET === buildTargets.firefox;

const manifest: Manifest.WebExtensionManifest = {
  action: {
    default_icon: "icon-34.png",
    default_popup: "src/pages/popup/index.html",
  },
  description: pkg.description,
  icons: {
    "128": "icon-128.png",
  },
  manifest_version: 3,
  name: "Timesheet Trail",
  permissions: ["history"],
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
