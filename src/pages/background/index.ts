import { commands, contextMenus, runtime } from "webextension-polyfill";

import { openHistory } from "@/src/services/history/openHistory";

const openMenuId = "open-timesheet-trail";

// Menus are kept by the browser once created, so they are only made on install and update.
runtime.onInstalled.addListener(() => {
  contextMenus.create({
    id: openMenuId,
    title: "Open Timesheet Trail",
    contexts: ["all"],
  });
});

contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId === openMenuId) {
    void openHistory();
  }
});

commands.onCommand.addListener((command) => {
  if (command === "open-history") {
    void openHistory();
  }
});
