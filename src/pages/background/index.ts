import { commands } from "webextension-polyfill";

import { openHistory } from "@/src/services/history/openHistory";

commands.onCommand.addListener((command) => {
  if (command === "open-history") {
    void openHistory();
  }
});
