import { runtime, tabs, windows } from "webextension-polyfill";

export const historyPagePath = "src/pages/history/index.html";

/** Focuses the open history tab, or opens one. */
export const openHistory = async () => {
  const url = runtime.getURL(historyPagePath);
  const [existing] = await tabs.query({ url });

  if (existing?.id !== undefined) {
    await tabs.update(existing.id, { active: true });
    // The tab may be in another window, which stays in the background otherwise.
    if (existing.windowId !== undefined) {
      await windows.update(existing.windowId, { focused: true });
    }
    return;
  }

  await tabs.create({ url });
};
