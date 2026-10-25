import { Button } from "@base-ui/react/button";

import { scrollStripClass, useScrollStrip } from "@/src/hooks/useScrollStrip";
import { cn } from "@/src/utils";

const hours = Array.from({ length: 24 }, (_, hour) => hour);

type Props = {
  /** Whether the day's visits have arrived; until then the strip is hidden, not shown as empty. */
  loaded: boolean;
  /** Visits per hour of the day in view. */
  counts: number[];
  /** The hour in view; `null` before the day's first hour. */
  active: number | null;
  /** Scrolls to that hour of the day in view. */
  onJump: (hour: number) => void;
};

const chipStyle =
  "flex h-7 items-center justify-center rounded-lg bg-control text-xs tabular-nums outline-none press hover:bg-hover focus-visible:ring-2 focus-visible:ring-purple disabled:pointer-events-none disabled:bg-transparent disabled:text-faint disabled:opacity-50";

const HourStrip = ({ loaded, counts, active, onJump }: Props) => {
  const strip = useScrollStrip(active);

  return (
    <div
      ref={strip.ref}
      style={strip.style}
      className={cn(
        scrollStripClass,
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        !loaded && "pointer-events-none opacity-0",
      )}
    >
      {hours.map((hour) => (
        <Button
          key={hour}
          disabled={counts[hour] === 0}
          onClick={() => onJump(hour)}
          className={cn(
            chipStyle,
            "min-w-8 flex-1 shrink-0 text-fg",
            active === hour && "bg-purple/15 text-purple",
          )}
        >
          {String(hour).padStart(2, "0")}
        </Button>
      ))}
    </div>
  );
};

export default HourStrip;
