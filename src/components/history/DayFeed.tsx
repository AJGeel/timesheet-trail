import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef } from "react";

import VisitList, { type VisitGroup } from "@/src/components/history/VisitList";
import type { Visit } from "@/src/services/history/types";

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

type Props = {
  /** Newest day first. */
  days: Date[];
  /** Visits per day (epoch ms of the day's start); a day missing from it is still loading. */
  byDay: Map<number, Visit[]>;
  /** The day in view, and its hour in view (`null` before its first hour group). */
  onActive: (day: Date, hour: number | null) => void;
  onLoadOlder: () => void;
};

/** Consecutive days, each with its visits by hour, that load older days when scrolled to the end. */
const DayFeed = ({ days, byDay, onActive, onLoadOlder }: Props) => {
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
            <VisitList groups={groups} />
          )}
        </div>
      ))}

      <div ref={endRef} className="h-px" />
    </div>
  );
};

export default DayFeed;
