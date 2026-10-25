import { EyeSlashIcon, TicketIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { PointerEvent } from "react";

import type { Edge } from "@/src/services/suggestions/resizeSuggestions";
import Button from "@/src/components/ui/Button";
import IconButton from "@/src/components/ui/IconButton";
import Panel from "@/src/components/ui/Panel";
import type { Visit } from "@/src/services/history/types";
import {
  hostOf,
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

const slotOptions = [5, 10, 15, 30, 60];

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
      <span className="h-1 w-8 rounded-full bg-hover opacity-0 transition-opacity group-hover/handle:opacity-100 group-focus-visible/handle:bg-blue group-focus-visible/handle:opacity-100" />
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

    <div className="sticky top-36 flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-1.5 font-semibold text-fg">
        <TicketIcon size={14} weight="fill" className="shrink-0 text-purple" />
        <span className="truncate">{suggestion.label}</span>
      </span>
      <span className="text-xs text-amber tabular-nums">
        {format(suggestion.start, "HH:mm")}–{format(suggestion.end, "HH:mm")}
        <span className="ml-2 text-muted">
          {duration((suggestion.end - suggestion.start) / 60_000)}
        </span>
      </span>
    </div>
  </Panel>
);

type BarProps = {
  settings: SuggestionSettings;
  /** Total of the day's suggestions, in minutes. */
  totalMinutes: number;
  onChange: (change: Partial<SuggestionSettings>) => void;
  /** Set when the day's suggestions were resized by hand; goes back to the automatic ones. */
  onReset?: () => void;
};

/** The slot length and hidden sites, above a day's suggestions. */
export const SuggestionBar = ({
  settings,
  totalMinutes,
  onChange,
  onReset,
}: BarProps) => (
  <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
    <span className="font-medium text-fg">
      Suggested{" "}
      <span className="text-amber tabular-nums">{duration(totalMinutes)}</span>
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

    <label className="flex items-center gap-2 text-muted">
      Slot
      <select
        value={settings.slotMinutes}
        onChange={(event) =>
          onChange({ slotMinutes: Number(event.target.value) })
        }
        className="h-7 rounded-lg bg-hover px-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue"
      >
        {slotOptions.map((minutes) => (
          <option key={minutes} value={minutes}>
            {minutes} min
          </option>
        ))}
      </select>
    </label>

    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <span className="text-muted">Hidden</span>
      {settings.hiddenHosts.length === 0 && (
        <span className="text-faint">none: use the eye on a site</span>
      )}
      {settings.hiddenHosts.map((host) => (
        <span
          key={host}
          className="inline-flex h-6 items-center gap-1 rounded-md bg-hover pr-1 pl-2 text-fg"
        >
          {host}
          <button
            type="button"
            aria-label={`Show ${host} again`}
            className="flex size-4 items-center justify-center rounded text-muted outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-blue"
            onClick={() =>
              onChange({
                hiddenHosts: settings.hiddenHosts.filter((h) => h !== host),
              })
            }
          >
            <XIcon size={10} weight="bold" />
          </button>
        </span>
      ))}
    </div>
  </Panel>
);

/** Stands beside visits that no suggestion covers: no ticket found, or a hidden site. */
export const EmptySuggestion = ({
  visits,
  slotMinutes,
  onHideHost,
}: {
  visits: Visit[];
  slotMinutes: number;
  onHideHost: (host: string) => void;
}) => {
  // Visits run newest first; the range is rounded out to whole slots, like the suggestions.
  const { from, to } = slotRange(
    visits[visits.length - 1].time,
    visits[0].time,
    slotMinutes,
  );
  const hosts = new Map<string, number>();
  for (const { url } of visits) {
    const host = hostOf(url);
    hosts.set(host, (hosts.get(host) ?? 0) + 1);
  }
  const [mostVisited] = [...hosts].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex h-full items-start gap-2 rounded-xl border border-dashed border-hover px-3 py-2">
      <div className="sticky top-36 flex min-w-0 flex-1 flex-col">
        <span className="text-faint">No ticket found</span>
        <span className="text-xs text-faint tabular-nums">
          {format(from, "HH:mm")}–{format(to, "HH:mm")}
        </span>
      </div>

      <IconButton
        label={`Hide ${mostVisited}`}
        className="sticky top-36 size-6"
        onClick={() => onHideHost(mostVisited)}
      >
        <EyeSlashIcon size={14} />
      </IconButton>
    </div>
  );
};
