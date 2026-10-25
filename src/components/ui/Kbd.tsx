import type { PropsWithChildren } from "react";

import { cn } from "@/src/utils";

/** A keyboard key. */
const Kbd = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <kbd
    className={cn(
      "inline-flex min-w-5 items-center justify-center rounded bg-hover px-1 font-mono text-[11px] text-muted",
      className,
    )}
  >
    {children}
  </kbd>
);

export default Kbd;
