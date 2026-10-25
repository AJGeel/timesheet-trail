import type { PropsWithChildren } from "react";

/** A keyboard key. */
const Kbd = ({ children }: PropsWithChildren) => (
  <kbd className="inline-flex min-w-5 items-center justify-center rounded bg-hover px-1 font-mono text-[11px] text-muted">
    {children}
  </kbd>
);

export default Kbd;
