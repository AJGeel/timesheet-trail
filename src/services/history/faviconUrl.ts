import { runtime } from "webextension-polyfill";

/**
 * Where to load a page's favicon from. Chrome serves it from its own cache
 * (the `favicon` permission). Firefox has no such API, so the site's own
 * `/favicon.ico` is requested instead: no third party sees what you visit.
 */
export const faviconUrl = (pageUrl: string) => {
  if (__CHROME_FAVICONS__) {
    return `${runtime.getURL("/_favicon/")}?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
  }

  try {
    const { protocol, host } = new URL(pageUrl);
    return protocol.startsWith("http")
      ? `${protocol}//${host}/favicon.ico`
      : undefined;
  } catch {
    return undefined;
  }
};
