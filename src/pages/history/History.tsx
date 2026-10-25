import {
  ArrowLineUpIcon,
  ClockCounterClockwiseIcon,
  EyeIcon,
  EyeSlashIcon,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AboutDialog, { aboutHint } from "@/src/components/history/AboutDialog";
import DayFeed, {
  dayAnchor,
  hourAnchor,
} from "@/src/components/history/DayFeed";
import DayStrip from "@/src/components/history/DayStrip";
import HourStrip from "@/src/components/history/HourStrip";
import VisitList, { type VisitGroup } from "@/src/components/history/VisitList";
import Button from "@/src/components/ui/Button";
import DatePicker from "@/src/components/ui/DatePicker";
import Tooltip from "@/src/components/ui/Tooltip";
import Panel from "@/src/components/ui/Panel";
import Input from "@/src/components/ui/Input";
import Kbd from "@/src/components/ui/Kbd";
import { useDayVisits } from "@/src/hooks/useDayVisits";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useSuggestionEdits } from "@/src/hooks/useSuggestionEdits";
import { useSuggestionSettings } from "@/src/hooks/useSuggestionSettings";
import { useVisits } from "@/src/hooks/useVisits";
import { cn } from "@/src/utils";

/** Searching spans all time, so only the newest matches are listed. */
const maxSearchResults = 300;
/** The days the strip shows. */
const daysPerPage = 7;
/**
 * Days the feed adds at a time, at first and each time it reaches its end: each is
 * a few hundred rows, so fewer at once keeps the page responsive.
 */
const feedBatch = 3;
/** A jump to a day this close to the end of the feed extends it, rather than starting a new one. */
const nearbyDays = 14;
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
  const {
    settings,
    update: changeSettings,
    shown: showSuggestions,
    toggleShown,
    loaded: settingsLoaded,
  } = useSuggestionSettings();

  const [dialog, setDialog] = useState<{ open: boolean; section?: "settings" }>(
    { open: false },
  );
  const openSettings = useCallback(
    () => setDialog({ open: true, section: "settings" }),
    [],
  );
  const {
    edits: suggestionEdits,
    setEdit: setSuggestionEdit,
    loaded: editsLoaded,
  } = useSuggestionEdits();

  // The feed shows `count` days from `feedStart` back; the strip follows the day in view.
  const [feedStart, setFeedStart] = useState(today);
  const [count, setCount] = useState(feedBatch);
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
      const behind = differenceInCalendarDays(feedStart, day);

      if (behind > 0 && behind <= nearbyDays) {
        // A little further back: keep the feed, and add the days up to it.
        setCount(behind + 1);
      } else {
        setFeedStart(day);
        setCount(feedBatch);
      }
    }
    setActiveDay(day);
    setScrollTarget({ id: dayAnchor(day), instant: !inFeed });
  };

  const jumpToHour = (hour: number) => {
    setActiveHour(hour);
    setScrollTarget({
      id: hourAnchor(activeDay, hour),
      instant: false,
    });
  };

  const showNewer = () => {
    const start = addDays(feedStart, feedBatch);
    const newStart = isAfter(start, today) ? today : start;

    setCount((c) => c + differenceInCalendarDays(newStart, feedStart));
    setFeedStart(newStart);
  };

  const oldestDay = addDays(today, -(maxDays - 1));
  const canStepBack = isAfter(activeDay, oldestDay);
  const canStepForward = isBefore(activeDay, today);

  const stepDay = (direction: -1 | 1) => {
    if (direction === -1 ? canStepBack : canStepForward) {
      jumpToDay(addDays(activeDay, direction));
    }
  };

  // Rendered from the saved state, not the defaults, so nothing visibly shifts at startup.
  if (!settingsLoaded || !editsLoaded) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-5">
      <header className="flex items-center gap-8">
        <Tooltip side="bottom" content={aboutHint}>
          <button
            type="button"
            onClick={() => setDialog({ open: true })}
            className="-mx-2 flex items-center gap-1 rounded-lg px-2 py-1 outline-none press hover:bg-control focus-visible:ring-2 focus-visible:ring-purple"
          >
            <img src="/icon-128.png" alt="" className="size-6" />
            <h1 className="text-base font-bold text-fg">Timesheet Trail</h1>
          </button>
        </Tooltip>

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
              onSelect={jumpToDay}
              onStep={stepDay}
              canStepBack={canStepBack}
              canStepForward={canStepForward}
            />
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <HourStrip
                  loaded={byDay.has(activeDay.getTime())}
                  counts={hourCounts}
                  active={activeHour}
                  onJump={jumpToHour}
                />
              </div>

              <Tooltip
                side="bottom"
                disabled={showSuggestions}
                content="Suggestions turn your visits into time slots, each matched to a ticket found in the pages you browsed."
              >
                <Button
                  variant="secondary"
                  aria-pressed={showSuggestions}
                  icon={
                    showSuggestions ? (
                      <EyeSlashIcon size={16} weight="bold" />
                    ) : (
                      <EyeIcon size={16} weight="bold" />
                    )
                  }
                  iconPosition="end"
                  onClick={toggleShown}
                  className="h-7 shrink-0"
                >
                  {/* Both labels share one cell so the button keeps the wider width. */}
                  <span className="grid">
                    <span
                      className={cn(
                        "col-start-1 row-start-1",
                        !showSuggestions && "invisible",
                      )}
                    >
                      Hide suggestions
                    </span>
                    <span
                      className={cn(
                        "col-start-1 row-start-1",
                        showSuggestions && "invisible",
                      )}
                    >
                      Show suggestions
                    </span>
                  </span>
                </Button>
              </Tooltip>
            </div>
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
            showSuggestions={showSuggestions}
            suggestionSettings={settings}
            onSuggestionSettings={changeSettings}
            suggestionEdits={suggestionEdits}
            onSuggestionEdit={setSuggestionEdit}
            onOpenSettings={openSettings}
            onLoadOlder={() =>
              setCount((c) => Math.min(c + feedBatch, maxDays))
            }
          />
        </>
      )}

      <AboutDialog
        open={dialog.open}
        section={dialog.section}
        onOpenChange={(open) => setDialog({ open })}
        settings={settings}
        onSettings={changeSettings}
      />
    </main>
  );
}
