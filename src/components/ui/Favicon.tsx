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

/** A page's favicon; the site's initial shows until it loads, or if it never does. */
const Favicon = ({ url }: { url: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : faviconUrl(url);

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded text-[10px] font-semibold text-muted",
        // Dark icons (GitHub, say) need a light backdrop in the dark theme.
        loaded ? "bg-white" : "bg-control",
      )}
    >
      {!loaded && host(url).charAt(0).toUpperCase()}
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute size-4 object-contain ${loaded ? "" : "opacity-0"}`}
        />
      )}
    </span>
  );
};

export default Favicon;
