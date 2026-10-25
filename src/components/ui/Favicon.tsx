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

/**
 * What came of loading a site's icon, so the many rows of one site neither flash
 * the initial again nor ask again for an icon that isn't there.
 */
const outcomes = new Map<string, "loaded" | "failed">();

/** A page's favicon; the site's initial shows until it loads, or if it never does. */
const Favicon = ({ url }: { url: string }) => {
  const site = host(url);
  const [outcome, setOutcome] = useState(outcomes.get(site));
  const loaded = outcome === "loaded";
  const src = outcome === "failed" ? undefined : faviconUrl(url);

  const settle = (result: "loaded" | "failed") => {
    outcomes.set(site, result);
    setOutcome(result);
  };

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded text-[10px] font-semibold text-muted",
        // Dark icons (GitHub, say) need a light backdrop in the dark theme.
        loaded ? "bg-white" : "bg-control",
      )}
    >
      {!loaded && site.charAt(0).toUpperCase()}
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => settle("loaded")}
          onError={() => settle("failed")}
          className={`absolute size-4 object-contain ${loaded ? "" : "opacity-0"}`}
        />
      )}
    </span>
  );
};

export default Favicon;
