import {
  ArrowLineUpIcon,
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

import DayFeed, {
  dayAnchor,
  hourAnchor,
} from "@/src/components/history/DayFeed";
import DayStrip from "@/src/components/history/DayStrip";
import HourStrip from "@/src/components/history/HourStrip";
import VisitList, { type VisitGroup } from "@/src/components/history/VisitList";
import Button from "@/src/components/ui/Button";
import DatePicker from "@/src/components/ui/DatePicker";
import Panel from "@/src/components/ui/Panel";
import Input from "@/src/components/ui/Input";
import Kbd from "@/src/components/ui/Kbd";
import { useDayVisits } from "@/src/hooks/useDayVisits";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useVisits } from "@/src/hooks/useVisits";

/** Searching spans all time, so only the newest matches are listed. */
const maxSearchResults = 300;
/** Days added each time the feed reaches its end. */
const daysPerPage = 7;
/** How far back the feed goes. */
const maxDays = 365;

const modKey = /Mac/.test(navigator.platform) ? "⌘" : "Ctrl";

const SearchResults = ({ text, today }: { text: string; today: Date }) => {
  const { visits, loading } = useVisits({
    text,
    start: 0,
    end: addDays(today, 1).getTime(),
  });

  const groups = useMemo(() => {
    const byDay = new Map<number, VisitGroup>();

    for (const visit of visits.slice(0, maxSearchResults)) {
      const day = startOfDay(visit.time);
      const group = byDay.get(day.getTime()) ?? {
        key: String(day.getTime()),
        label: format(day, "EEEE d MMMM yyyy"),
        visits: [],
      };
      group.visits.push(visit);
      byDay.set(day.getTime(), group);
    }

    return [...byDay.values()];
  }, [visits]);

  return (
    <>
      <h2 className="text-sm font-semibold text-fg">Results for “{text}”</h2>

      {!loading && groups.length === 0 ? (
        <Panel className="flex flex-col items-center gap-3 py-16 text-muted">
          <ClockCounterClockwiseIcon size={40} weight="duotone" />
          Nothing found.
        </Panel>
      ) : (
        <VisitList groups={groups} />
      )}
    </>
  );
};

export default function History() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const searchRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  // The feed shows `count` days from `feedStart` back; the strip follows the day in view.
  const [feedStart, setFeedStart] = useState(today);
  const [count, setCount] = useState(daysPerPage);
  const [activeDay, setActiveDay] = useState(today);
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const [stripNewest, setStripNewest] = useState(today);
  const [scrollTarget, setScrollTarget] = useState<{
    id: string;
    instant: boolean;
  }>();

  const query = useDebouncedValue(text.trim());
  const searching = query !== "";

  const days = useMemo(
    () => Array.from({ length: count }, (_, i) => addDays(feedStart, -i)),
    [feedStart, count],
  );
  const byDay = useDayVisits(days);

  const hourCounts = useMemo(() => {
    const counts = Array<number>(24).fill(0);
    for (const visit of byDay.get(activeDay.getTime()) ?? []) {
      counts[new Date(visit.time).getHours()]++;
    }
    return counts;
  }, [byDay, activeDay]);

  // ⌘K / Ctrl+K jumps to the search field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Keep the strip's week around the day in view.
  useEffect(() => {
    const oldest = addDays(stripNewest, -(daysPerPage - 1));

    if (isAfter(activeDay, stripNewest)) {
      const newest = addDays(activeDay, daysPerPage - 1);
      setStripNewest(isAfter(newest, today) ? today : newest);
    } else if (isBefore(activeDay, oldest)) {
      setStripNewest(activeDay);
    }
  }, [activeDay, stripNewest, today]);

  // Scrolls once the target is in the page: a jump may first have to add days.
  useEffect(() => {
    if (!scrollTarget) return;

    const element = document.getElementById(scrollTarget.id);
    if (!element) return;

    element.scrollIntoView({
      behavior: scrollTarget.instant ? "instant" : "smooth",
      block: "start",
    });
    setScrollTarget(undefined);
  }, [scrollTarget, days, byDay]);

  const jumpToDay = (day: Date) => {
    const inFeed = days.some((d) => d.getTime() === day.getTime());

    if (!inFeed) {
      setFeedStart(day);
      setCount(daysPerPage);
    }
    setActiveDay(day);
    setScrollTarget({ id: dayAnchor(day), instant: !inFeed });
  };

  const jumpToHour = (hour: number | null) => {
    setActiveHour(hour);
    setScrollTarget({
      id: hour === null ? dayAnchor(activeDay) : hourAnchor(activeDay, hour),
      instant: false,
    });
  };

  const showNewer = () => {
    const start = addDays(feedStart, daysPerPage);
    const newStart = isAfter(start, today) ? today : start;

    setCount((c) => c + differenceInCalendarDays(newStart, feedStart));
    setFeedStart(newStart);
  };

  const shiftStrip = (shift: number) => {
    const shifted = addDays(stripNewest, shift);
    setStripNewest(isAfter(shifted, today) ? today : shifted);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-6 py-5">
      <header className="flex items-center gap-4">
        <img src="/icon-128.png" alt="" className="size-6" />
        <h1 className="text-base font-semibold text-fg">Timesheet Trail</h1>

        <div className="flex-1">
          <Input
            ref={searchRef}
            icon={<MagnifyingGlassIcon size={16} weight="bold" />}
            trailing={
              <span className="flex gap-1">
                <Kbd>{modKey}</Kbd>
                <Kbd>K</Kbd>
              </span>
            }
            placeholder="Search title or URL"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        <DatePicker value={activeDay} max={today} onChange={jumpToDay} />
      </header>

      {searching ? (
        <SearchResults text={query} today={today} />
      ) : (
        <>
          <div className="sticky top-0 z-10 -mx-6 flex flex-col gap-2 bg-canvas px-6 pt-2 pb-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-linear-to-b after:from-canvas after:to-transparent">
            <DayStrip
              selected={activeDay}
              newest={stripNewest}
              today={today}
              onSelect={jumpToDay}
              onShift={shiftStrip}
            />
            <HourStrip
              counts={hourCounts}
              active={activeHour}
              onJump={jumpToHour}
            />
          </div>

          {feedStart.getTime() !== today.getTime() && (
            <Button
              variant="secondary"
              icon={<ArrowLineUpIcon size={16} weight="bold" />}
              onClick={showNewer}
            >
              Show newer days
            </Button>
          )}

          <DayFeed
            days={days}
            byDay={byDay}
            onActive={(day, hour) => {
              setActiveDay((previous) =>
                previous.getTime() === day.getTime() ? previous : day,
              );
              setActiveHour(hour);
            }}
            onLoadOlder={() =>
              setCount((c) => Math.min(c + daysPerPage, maxDays))
            }
          />
        </>
      )}
    </main>
  );
}
