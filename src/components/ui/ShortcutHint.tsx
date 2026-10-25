import { Fragment } from "react";

import { useOpenShortcut } from "@/src/hooks/useOpenShortcut";
import { keyName } from "@/src/services/shortcut";
import { cn } from "@/src/utils";

import Kbd from "./Kbd";

/** Tells how to open the history from the keyboard, each key named; nothing if the browser has no shortcut set. */
const ShortcutHint = ({
  className,
  keyClassName,
}: {
  className?: string;
  /** Added to each key, e.g. to match what the hint sits on. */
  keyClassName?: string;
}) => {
  const keys = useOpenShortcut();
  if (keys.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2 text-muted", className)}>
      <span>Pro-tip: open from anywhere with</span>

      <span className="flex flex-wrap items-center gap-1.5">
        {keys.map((key, index) => (
          <Fragment key={key}>
            {index > 0 && <span className="text-faint">+</span>}
            <Kbd
              className={cn(
                "h-7 gap-1.5 px-2.5 text-[13px] text-fg",
                keyClassName,
              )}
            >
              {keyName(key) !== key && (
                <span className="text-base leading-none text-muted">{key}</span>
              )}
              {keyName(key)}
            </Kbd>
          </Fragment>
        ))}
      </span>
    </div>
  );
};

export default ShortcutHint;
