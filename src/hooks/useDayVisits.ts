import { addDays } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { searchVisits } from "@/src/services/history/searchVisits";
import type { Visit } from "@/src/services/history/types";

/**
 * The visits of each given day (start-of-day dates), keyed by the day's epoch ms.
 * Days are fetched once and kept, so scrolling back over them is instant.
 */
export const useDayVisits = (days: Date[]) => {
  const [byDay, setByDay] = useState<Map<number, Visit[]>>(new Map());
  const requested = useRef(new Set<number>());

  useEffect(() => {
    for (const day of days) {
      const key = day.getTime();
      if (requested.current.has(key)) continue;
      requested.current.add(key);

      searchVisits({ start: key, end: addDays(day, 1).getTime() }).then(
        (visits) => setByDay((previous) => new Map(previous).set(key, visits)),
      );
    }
  }, [days]);

  return byDay;
};
