import { runtime, tabs } from "webextension-polyfill";

export const historyPagePath = "src/pages/history/index.html";

/** Focuses the open history tab, or opens one. */
export const openHistory = async () => {
  const url = runtime.getURL(historyPagePath);
  const [existing] = await tabs.query({ url });

  if (existing?.id !== undefined) {
    await tabs.update(existing.id, { active: true });
    return;
  }

  await tabs.create({ url });
};
