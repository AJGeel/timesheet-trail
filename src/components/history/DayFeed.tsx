import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import {
  EmptySuggestion,
  SuggestionBar,
  SuggestionCard,
} from "@/src/components/history/Suggestions";
import VisitList, { type VisitGroup } from "@/src/components/history/VisitList";
import type { SuggestionEdits } from "@/src/hooks/useSuggestionEdits";
import type { Visit } from "@/src/services/history/types";
import {
  mergeAdjacent,
  resizeSuggestion,
  setEdge,
  type Edge,
} from "@/src/services/suggestions/resizeSuggestions";
import {
  suggestSlots,
  type Suggestion,
  type SuggestionSettings,
} from "@/src/services/suggestions/suggestSlots";

/** Distance from the viewport top below which a heading isn't yet the day in view. */
const activeLine = 140;

export const dayAnchor = (day: Date) => `day-${day.getTime()}`;
export const hourAnchor = (day: Date, hour: number) =>
  `day-${day.getTime()}-${hour}`;

const dayLabel = (day: Date) => {
  const date = format(day, "EEEE, yyyy/MM/dd");
  if (isToday(day)) return `Today · ${date}`;
  if (isYesterday(day)) return `Yesterday · ${date}`;
  return date;
};

const hourGroups = (day: Date, visits: Visit[]): VisitGroup[] => {
  const groups = new Map<number, VisitGroup>();

  for (const visit of visits) {
    const hour = new Date(visit.time).getHours();
    const group = groups.get(hour) ?? {
      key: String(hour),
      label: `${String(hour).padStart(2, "0")}:00`,
      visits: [],
      anchor: hourAnchor(day, hour),
    };
    group.visits.push(visit);
    groups.set(hour, group);
  }

  return [...groups.values()];
};

type DayVisitsProps = {
  /** The day's start, epoch ms. */
  day: number;
  visits: Visit[];
  groups: VisitGroup[];
  /** Whether suggested time slots sit beside the visits. */
  suggesting: boolean;
  settings: SuggestionSettings;
  onSettings: (change: Partial<SuggestionSettings>) => void;
  /** The suggestions as the user resized them, if they did. */
  edited?: Suggestion[];
  onEdit: (day: number, suggestions?: Suggestion[]) => void;
};

/** The time of the visit row nearest to a vertical position, within the visits' rows. */
const timeAt = (container: HTMLElement, y: number) => {
  let nearest: { time: number; distance: number } | undefined;

  for (const row of container.querySelectorAll<HTMLElement>(
    "[data-visit-time]",
  )) {
    const { top, bottom } = row.getBoundingClientRect();
    const distance = y < top ? top - y : y > bottom ? y - bottom : 0;

    if (!nearest || distance < nearest.distance) {
      nearest = { time: Number(row.dataset.visitTime), distance };
    }
  }

  return nearest?.time;
};

/** A day's visits by hour, with its suggested time slots beside them when asked for. */
const DayVisits = ({
  day,
  visits,
  groups,
  suggesting,
  settings,
  onSettings,
  edited,
  onEdit,
}: DayVisitsProps) => {
  const container = useRef<HTMLDivElement>(null);
  // The suggestions while an edge is being dragged, before they are kept.
  const [draft, setDraft] = useState<Suggestion[]>();

  const automatic = useMemo(
    () => (suggesting ? suggestSlots(visits, settings) : []),
    [suggesting, visits, settings],
  );
  const kept = edited ?? automatic;
  const suggestions = draft ?? kept;

  if (!suggesting) return <VisitList groups={groups} />;

  const hideHost = (host: string) =>
    onSettings({ hiddenHosts: [...settings.hiddenHosts, host] });

  const startResize = (
    id: string,
    edge: Edge,
    event: PointerEvent<HTMLElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();

    // Every move is worked out from the start, so dragging back gives the neighbours back.
    const from = kept;
    let latest: Suggestion[] | undefined;
    let frame = 0;
    let y = event.clientY;

    const update = () => {
      frame = 0;
      const time = container.current ? timeAt(container.current, y) : undefined;
      if (time === undefined) return;

      latest = resizeSuggestion(from, id, edge, time, settings.slotMinutes);
      setDraft(latest);
    };
    const onMove = (move: globalThis.PointerEvent) => {
      y = move.clientY;
      frame ||= requestAnimationFrame(update);
    };
    const end = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (latest) onEdit(day, mergeAdjacent(latest));
      setDraft(undefined);
    };

    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const nudge = (id: string, edge: Edge, direction: 1 | -1) => {
    const target = kept.find((suggestion) => suggestion.id === id);
    if (!target) return;

    // Growing moves the end later and the start earlier.
    const step = settings.slotMinutes * 60_000 * direction;
    const boundary = edge === "end" ? target.end + step : target.start - step;

    onEdit(
      day,
      mergeAdjacent(setEdge(kept, id, edge, boundary, settings.slotMinutes)),
    );
  };

  const totalMinutes = suggestions.reduce(
    (sum, { start, end }) => sum + (end - start) / 60_000,
    0,
  );

  return (
    <div ref={container} className="flex flex-col gap-3">
      <SuggestionBar
        settings={settings}
        totalMinutes={totalMinutes}
        onChange={onSettings}
        onReset={edited && (() => onEdit(day))}
      />
      <VisitList
        groups={groups}
        gap={(gapVisits) => (
          <EmptySuggestion
            visits={gapVisits}
            slotMinutes={settings.slotMinutes}
            onHideHost={hideHost}
          />
        )}
        asides={suggestions.map((suggestion) => ({
          key: suggestion.id,
          start: suggestion.start,
          end: suggestion.end,
          content: (
            <SuggestionCard
              suggestion={suggestion}
              onResizeStart={(edge, event) =>
                startResize(suggestion.id, edge, event)
              }
              onNudge={(edge, direction) =>
                nudge(suggestion.id, edge, direction)
              }
            />
          ),
        }))}
      />
    </div>
  );
};

type Props = {
  /** Newest day first. */
  days: Date[];
  /** Visits per day (epoch ms of the day's start); a day missing from it is still loading. */
  byDay: Map<number, Visit[]>;
  /** The day in view, and its hour in view (`null` before its first hour group). */
  onActive: (day: Date, hour: number | null) => void;
  onLoadOlder: () => void;
  /** Whether suggested time slots sit beside the visits. */
  showSuggestions: boolean;
  suggestionSettings: SuggestionSettings;
  onSuggestionSettings: (change: Partial<SuggestionSettings>) => void;
  /** Days (start, epoch ms) whose suggestions were resized by hand. */
  suggestionEdits: SuggestionEdits;
  onSuggestionEdit: (day: number, suggestions?: Suggestion[]) => void;
};

/** Consecutive days, each with its visits by hour, that load older days when scrolled to the end. */
const DayFeed = ({
  days,
  byDay,
  onActive,
  onLoadOlder,
  showSuggestions,
  suggestionSettings,
  onSuggestionSettings,
  suggestionEdits,
  onSuggestionEdit,
}: Props) => {
  const endRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onActive, onLoadOlder });
  callbacks.current = { onActive, onLoadOlder };

  // The day in view is the last one whose heading has scrolled up to the sticky strips,
  // and the hour in view the last of its hour groups that has.
  useEffect(() => {
    let frame = 0;

    const passed = (id: string) => {
      const element = document.getElementById(id);
      return !!element && element.getBoundingClientRect().top <= activeLine;
    };

    const update = () => {
      frame = 0;
      let active = days[0];

      for (const day of days) {
        if (!document.getElementById(dayAnchor(day))) break;
        if (!passed(dayAnchor(day))) break;
        active = day;
      }
      if (!active) return;

      // Hour groups run newest first, so the last one that has passed is in view.
      let hour: number | null = null;
      for (let h = 23; h >= 0; h--) {
        if (passed(hourAnchor(active, h))) hour = h;
      }

      callbacks.current.onActive(active, hour);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [days, byDay]);

  useEffect(() => {
    const end = endRef.current;
    if (!end) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && callbacks.current.onLoadOlder(),
      { rootMargin: "0px 0px 600px 0px" },
    );
    observer.observe(end);

    return () => observer.disconnect();
  }, [days, byDay]);

  const sections = useMemo(
    () =>
      days.map((day) => {
        const visits = byDay.get(day.getTime());
        return { day, visits, groups: visits && hourGroups(day, visits) };
      }),
    [days, byDay],
  );

  return (
    <div className="flex flex-col gap-8">
      {sections.map(({ day, visits, groups }) => (
        <div key={day.getTime()} className="flex flex-col gap-3">
          <h2
            id={dayAnchor(day)}
            data-day={day.getTime()}
            className="scroll-mt-32 text-sm font-semibold text-fg"
          >
            {dayLabel(day)}
          </h2>

          {!groups ? (
            <div className="h-24 animate-pulse rounded-xl bg-control" />
          ) : groups.length === 0 ? (
            <p className="px-3 text-faint">Nothing visited.</p>
          ) : (
            <DayVisits
              day={day.getTime()}
              visits={visits!}
              groups={groups}
              suggesting={showSuggestions}
              settings={suggestionSettings}
              onSettings={onSuggestionSettings}
              edited={suggestionEdits[day.getTime()]}
              onEdit={onSuggestionEdit}
            />
          )}
        </div>
      ))}

      <div ref={endRef} className="h-px" />
    </div>
  );
};

export default DayFeed;
