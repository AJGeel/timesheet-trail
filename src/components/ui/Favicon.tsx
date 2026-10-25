import { useState } from "react";

import { cn } from "@/src/utils";
import { faviconUrl } from "@/src/services/history/faviconUrl";

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

type Outcome = "loaded" | "failed";

const storageKey = "faviconHosts";
/** Past this many remembered sites the oldest are forgotten. */
const maxRemembered = 1000;

/** Sites whose icon has loaded before, in earlier sessions too, so their rows skip the placeholder. */
const remembered = (() => {
  try {
    return new Set<string>(
      JSON.parse(localStorage.getItem(storageKey) ?? "[]"),
    );
  } catch {
    return new Set<string>();
  }
})();

const remember = (site: string) => {
  if (remembered.has(site)) return;

  remembered.add(site);
  while (remembered.size > maxRemembered) {
    remembered.delete(remembered.values().next().value as string);
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify([...remembered]));
  } catch {
    // Storage is only an optimisation.
  }
};

/**
 * What came of loading a site's icon, so the many rows of one site neither flash
 * the initial again nor ask again for an icon that isn't there.
 */
const outcomes = new Map<string, Outcome>(
  [...remembered].map((site) => [site, "loaded"]),
);

/**
 * A page's favicon; the site's initial shows until it loads, or if it never does.
 * The two cross-fade, and a site seen before starts out as its icon, so nothing swaps.
 */
const Favicon = ({ url }: { url: string }) => {
  const site = host(url);
  const [outcome, setOutcome] = useState(outcomes.get(site));
  // Whether this row's image has arrived; a remembered site is `loaded` before it has.
  const [ready, setReady] = useState(false);
  const loaded = outcome === "loaded";
  const src = outcome === "failed" ? undefined : faviconUrl(url);

  const settle = (result: Outcome) => {
    outcomes.set(site, result);
    if (result === "loaded") remember(site);
    else remembered.delete(site);
    setOutcome(result);
    if (result === "loaded") setReady(true);
  };

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded text-[10px] font-semibold text-muted transition-colors duration-200 ease-out motion-reduce:transition-none",
        // Dark icons (GitHub, say) need a light backdrop in the dark theme.
        loaded ? "bg-white" : "bg-control",
      )}
    >
      <span
        className={cn(
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          loaded && "opacity-0",
        )}
      >
        {site.charAt(0).toUpperCase()}
      </span>
      {src && (
        <img
          // An icon that is already decoded has loaded by the time this mounts.
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) settle("loaded");
          }}
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => settle("loaded")}
          onError={() => settle("failed")}
          className={cn(
            "absolute size-4 object-contain transition-opacity duration-200 ease-out motion-reduce:transition-none",
            !ready && "opacity-0",
          )}
        />
      )}
    </span>
  );
};

export default Favicon;
