import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { addDays, format, isSameDay, isToday, isYesterday } from "date-fns";

import IconButton from "@/src/components/ui/IconButton";
import { scrollStripClass, useScrollStrip } from "@/src/hooks/useScrollStrip";
import { cn } from "@/src/utils";

const shownDays = 7;

type Props = {
  selected: Date;
  /** The newest day in the strip. */
  newest: Date;
  onSelect: (day: Date) => void;
  /** Selects the day before (`-1`) or after (`1`) the selected one. */
  onStep: (direction: -1 | 1) => void;
  canStepBack: boolean;
  canStepForward: boolean;
};

const label = (day: Date) => {
  if (isToday(day)) return "Today";
  if (isYesterday(day)) return "Yesterday";
  return format(day, "EEEE");
};

const DayStrip = ({
  selected,
  newest,
  onSelect,
  onStep,
  canStepBack,
  canStepForward,
}: Props) => {
  const days = Array.from({ length: shownDays }, (_, i) => addDays(newest, -i));
  const selectedIndex = days.findIndex((day) => isSameDay(day, selected));
  const strip = useScrollStrip(selectedIndex === -1 ? null : selectedIndex);

  return (
    <div className="flex items-center gap-3">
      <IconButton
        label="Next day"
        disabled={!canStepForward}
        onClick={() => onStep(1)}
      >
        <CaretLeftIcon size={18} weight="bold" />
      </IconButton>

      <ToggleGroup
        value={[selected.toISOString()]}
        onValueChange={([next]) => next && onSelect(new Date(next))}
        ref={strip.ref}
        style={strip.style}
        className={cn(scrollStripClass, "min-w-0 flex-1 gap-1.5")}
      >
        {days.map((day) => (
          <Toggle
            key={day.toISOString()}
            value={day.toISOString()}
            aria-label={format(day, "EEEE d MMMM")}
            className={cn(
              "flex min-w-22 flex-1 shrink-0 flex-col items-center rounded-lg bg-control px-2 py-1.5 leading-tight outline-none press focus-visible:ring-2 focus-visible:ring-purple",
              "hover:bg-hover data-pressed:bg-purple/15",
            )}
          >
            <span
              className={cn(
                "font-medium",
                isSameDay(day, selected) ? "text-purple" : "text-fg",
              )}
            >
              {label(day)}
            </span>
            <span
              className={cn(
                "text-xs",
                isSameDay(day, selected) ? "text-purple" : "text-faint",
              )}
            >
              {format(day, "MMM d")}
            </span>
          </Toggle>
        ))}
      </ToggleGroup>

      <IconButton
        label="Previous day"
        disabled={!canStepBack}
        onClick={() => onStep(-1)}
      >
        <CaretRightIcon size={18} weight="bold" />
      </IconButton>
    </div>
  );
};

export default DayStrip;
