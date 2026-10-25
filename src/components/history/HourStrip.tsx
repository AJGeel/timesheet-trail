import { Button } from "@base-ui/react/button";

import { cn } from "@/src/utils";

const hours = Array.from({ length: 24 }, (_, hour) => hour);

type Props = {
  /** Visits per hour of the day in view. */
  counts: number[];
  /** The hour in view; `null` before the day's first hour. */
  active: number | null;
  /** Scrolls to that hour of the day in view. */
  onJump: (hour: number) => void;
};

const chip =
  "flex h-7 items-center justify-center rounded-lg bg-control text-xs tabular-nums outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-blue disabled:pointer-events-none disabled:bg-transparent disabled:text-faint disabled:opacity-50";

const HourStrip = ({ counts, active, onJump }: Props) => (
  <div className="flex items-center gap-1">
    {hours.map((hour) => (
      <Button
        key={hour}
        disabled={counts[hour] === 0}
        onClick={() => onJump(hour)}
        className={cn(
          chip,
          "min-w-0 flex-1 text-fg",
          active === hour && "bg-purple/15 text-purple",
        )}
      >
        {String(hour).padStart(2, "0")}
      </Button>
    ))}
  </div>
);

export default HourStrip;
