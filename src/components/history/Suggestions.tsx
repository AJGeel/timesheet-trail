import { SlidersHorizontalIcon, TicketIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { PointerEvent } from "react";

import type { Edge } from "@/src/services/suggestions/resizeSuggestions";
import { SlotSelect } from "@/src/components/history/SettingsFields";
import Button from "@/src/components/ui/Button";
import Panel from "@/src/components/ui/Panel";
import type { Visit } from "@/src/services/history/types";
import {
  slotRange,
  type Suggestion,
} from "@/src/services/suggestions/suggestSlots";
import type { SuggestionSettings } from "@/src/services/suggestions/suggestSlots";

export const duration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
};

type CardProps = {
  suggestion: Suggestion;
  /** A drag on one of the edges: the top edge is the end, as the newest comes first. */
  onResizeStart: (edge: Edge, event: PointerEvent<HTMLElement>) => void;
  /** An arrow key on an edge: `1` makes the suggestion a slot longer, `-1` shorter. */
  onNudge: (edge: Edge, direction: 1 | -1) => void;
};

const Handle = ({
  edge,
  onResizeStart,
  onNudge,
}: Pick<CardProps, "onResizeStart" | "onNudge"> & { edge: Edge }) => {
  const top = edge === "end";

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={top ? "Resize the end" : "Resize the start"}
      tabIndex={0}
      onPointerDown={(event) => onResizeStart(edge, event)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        // The top edge grows upwards, the bottom edge downwards.
        const grows = event.key === (top ? "ArrowUp" : "ArrowDown");
        onNudge(edge, grows ? 1 : -1);
      }}
      className={`group/handle absolute inset-x-0 z-10 flex h-3 cursor-ns-resize touch-none items-center justify-center outline-none select-none ${top ? "-top-1.5" : "-bottom-1.5"}`}
    >
      <span className="h-1 w-8 rounded-full bg-hover opacity-0 transition-opacity group-hover/handle:opacity-100 group-focus-visible/handle:bg-purple group-focus-visible/handle:opacity-100" />
    </div>
  );
};

/** One suggested entry; it stays in view while the visits beside it scroll. */
export const SuggestionCard = ({
  suggestion,
  onResizeStart,
  onNudge,
}: CardProps) => (
  <Panel
    title={
      suggestion.sources.length
        ? `From ${suggestion.sources.join(", ")}`
        : undefined
    }
    className="relative flex h-full items-start gap-2 px-3 py-2"
  >
    <Handle edge="end" onResizeStart={onResizeStart} onNudge={onNudge} />
    <Handle edge="start" onResizeStart={onResizeStart} onNudge={onNudge} />

    <div className="sticky top-28 flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-1.5 font-semibold text-fg">
        <TicketIcon size={14} weight="fill" className="shrink-0 text-purple" />
        <span className="truncate">{suggestion.label}</span>
      </span>
      <span className="text-xs text-purple tabular-nums">
        {format(suggestion.start, "HH:mm")}–{format(suggestion.end, "HH:mm")}
        <span className="ml-2 text-muted">
          {duration((suggestion.end - suggestion.start) / 60_000)}
        </span>
      </span>
    </div>
  </Panel>
);

/** A working day, which the graph is measured against, in minutes. */
const workday = 8 * 60;

/**
 * The day's suggestions as a small bar against a working day of 8 hours, one block
 * each. Time past the 8 hours is lighter, and the bar grows to fit it.
 */
const DayGraph = ({ suggestions }: { suggestions: Suggestion[] }) => {
  const blocks: { key: string; minutes: number; over: boolean }[] = [];
  let done = 0;

  for (const { id, start, end } of suggestions) {
    const minutes = (end - start) / 60_000;
    const within = Math.max(0, Math.min(minutes, workday - done));

    if (within > 0) blocks.push({ key: id, minutes: within, over: false });
    if (minutes - within > 0) {
      blocks.push({ key: `${id}-over`, minutes: minutes - within, over: true });
    }
    done += minutes;
  }

  const span = Math.max(workday, done);

  return (
    <div
      role="img"
      aria-label={`${duration(done)} suggested, of a working day of ${duration(workday)}`}
      className="flex h-1.5 w-20 shrink-0 gap-px overflow-hidden rounded-full bg-hover"
    >
      {blocks.map(({ key, minutes, over }) => (
        <span
          key={key}
          style={{ width: `${(minutes / span) * 100}%` }}
          className={`h-full shrink-0 transition-[width] duration-150 ease-out motion-reduce:transition-none ${over ? "bg-purple/40" : "bg-purple"}`}
        />
      ))}
    </div>
  );
};

type BarProps = {
  settings: SuggestionSettings;
  /** The day's suggestions, as shown. */
  suggestions: Suggestion[];
  onChange: (change: Partial<SuggestionSettings>) => void;
  /** Set when the day's suggestions were resized by hand; goes back to the automatic ones. */
  onReset?: () => void;
  onOpenSettings: () => void;
};

/** The slot length, and the way to the settings, above a day's suggestions. */
export const SuggestionBar = ({
  settings,
  suggestions,
  onChange,
  onReset,
  onOpenSettings,
}: BarProps) => (
  <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
    <span className="flex items-center gap-3 font-medium text-fg">
      <span>
        Suggested{" "}
        <span className="text-purple tabular-nums">
          {duration(
            suggestions.reduce(
              (sum, { start, end }) => sum + (end - start),
              0,
            ) / 60_000,
          )}
        </span>
        <span className="text-faint"> / {duration(workday)}</span>
      </span>
      <DayGraph suggestions={suggestions} />
    </span>

    {onReset && (
      <Button
        variant="ghost"
        className="h-6 px-2"
        title="Go back to the automatic suggestions for this day"
        onClick={onReset}
      >
        Edited · Reset
      </Button>
    )}

    <SlotSelect
      slotMinutes={settings.slotMinutes}
      onChange={(slotMinutes) => onChange({ slotMinutes })}
    />

    <Button
      variant="ghost"
      className="ml-auto h-7 px-2"
      icon={<SlidersHorizontalIcon size={14} weight="bold" />}
      onClick={onOpenSettings}
    >
      Change settings
    </Button>
  </Panel>
);

/** Stands beside visits that no suggestion covers: no ticket was found in them. */
export const EmptySuggestion = ({
  visits,
  slotMinutes,
}: {
  visits: Visit[];
  slotMinutes: number;
}) => {
  // Visits run newest first; the range is rounded out to whole slots, like the suggestions.
  const { from, to } = slotRange(
    visits[visits.length - 1].time,
    visits[0].time,
    slotMinutes,
  );

  return (
    <div className="flex h-full items-start rounded-xl border border-dashed border-hover px-3 py-2">
      <div className="sticky top-36 flex min-w-0 flex-col">
        <span className="text-faint">No ticket found</span>
        <span className="text-xs text-faint tabular-nums">
          {format(from, "HH:mm")}–{format(to, "HH:mm")}
        </span>
      </div>
    </div>
  );
};
