import { Popover } from "@base-ui/react/popover";
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useState, type CSSProperties } from "react";

import IconButton from "@/src/components/ui/IconButton";
import { cn } from "@/src/utils";

type Props = {
  value: Date;
  /** The last selectable day. */
  max: Date;
  onChange: (day: Date) => void;
};

const weekOptions = { weekStartsOn: 1 } as const;
const weekdays = eachDayOfInterval({
  start: startOfWeek(new Date(), weekOptions),
  end: endOfWeek(new Date(), weekOptions),
}).map((day) => format(day, "EEEEEE"));

/** A button that opens a month calendar. */
const DatePicker = ({ value, max, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(startOfMonth(value));
  // Which way the month last changed, for the grid to slide in from that side.
  const [direction, setDirection] = useState<1 | -1>(1);

  const changeMonth = (by: 1 | -1) => {
    setDirection(by);
    setMonth(addMonths(month, by));
  };

  const days = eachDayOfInterval({
    start: startOfWeek(month, weekOptions),
    end: endOfWeek(endOfMonth(month), weekOptions),
  });

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        // Open on the month of the selected day.
        if (next) setMonth(startOfMonth(value));
        setOpen(next);
      }}
    >
      <Popover.Trigger className="flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-fg outline-none press hover:bg-hover focus-visible:ring-2 focus-visible:ring-purple data-popup-open:bg-hover">
        <CalendarBlankIcon size={16} weight="bold" className="text-faint" />
        {format(value, "d MMM yyyy")}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50"
        >
          <Popover.Popup className="w-64 origin-top-right rounded-xl bg-control p-3 text-fg shadow-2xl shadow-black/25 outline-none transition-[opacity,scale,translate] duration-150 ease-out data-ending-style:-translate-y-1 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            <div className="mb-2 flex items-center justify-between">
              <IconButton
                label="Previous month"
                className="size-7 bg-transparent"
                onClick={() => changeMonth(-1)}
              >
                <CaretLeftIcon size={14} weight="bold" />
              </IconButton>
              <span className="font-medium">{format(month, "MMMM yyyy")}</span>
              <IconButton
                label="Next month"
                className="size-7 bg-transparent"
                disabled={isAfter(startOfMonth(addMonths(month, 1)), max)}
                onClick={() => changeMonth(1)}
              >
                <CaretRightIcon size={14} weight="bold" />
              </IconButton>
            </div>

            <div
              key={month.getTime()}
              style={{ "--from": `${direction * 16}px` } as CSSProperties}
              className="grid animate-[month-in_150ms_ease-out] grid-cols-7 gap-0.5 text-center motion-reduce:animate-none"
            >
              {weekdays.map((weekday) => (
                <span key={weekday} className="py-1 text-xs text-faint">
                  {weekday}
                </span>
              ))}

              {days.map((day) => {
                const selected = isSameDay(day, value);

                return (
                  <button
                    key={day.getTime()}
                    type="button"
                    disabled={isAfter(day, max)}
                    aria-label={format(day, "EEEE d MMMM yyyy")}
                    aria-pressed={selected}
                    onClick={() => {
                      onChange(day);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-8 items-center justify-center rounded-lg tabular-nums outline-none press hover:bg-hover focus-visible:ring-2 focus-visible:ring-purple disabled:pointer-events-none disabled:opacity-30",
                      !isSameMonth(day, month) && "text-faint",
                      isSameDay(day, max) && !selected && "text-purple",
                      selected && "bg-purple/15 font-medium text-purple",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default DatePicker;
