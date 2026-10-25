import { history, type History } from "webextension-polyfill";

import { searchMockVisits } from "./mockHistory";
import type { Visit, VisitQuery } from "./types";

const maxPages = 5000;
const parallelLookups = 25;

const visitsOf = async (
  item: History.HistoryItem,
  { start, end }: VisitQuery,
) => {
  const url = item.url ?? "";
  const visits = await history.getVisits({ url });

  return visits
    .filter(({ visitTime = 0 }) => visitTime >= start && visitTime < end)
    .map(({ visitId, visitTime = 0 }): Visit => ({
      id: visitId,
      url,
      title: item.title || url,
      time: visitTime,
    }));
};

/**
 * Every visit in the range, newest first. `history.search` returns one item per
 * page, so each page's visits are looked up to get their individual times.
 */
const searchBrowserVisits = async (query: VisitQuery) => {
  const items = await history.search({
    text: query.text ?? "",
    startTime: query.start,
    endTime: query.end,
    maxResults: maxPages,
  });
  const visits: Visit[] = [];

  for (let i = 0; i < items.length; i += parallelLookups) {
    const chunk = items.slice(i, i + parallelLookups);
    visits.push(
      ...(await Promise.all(chunk.map((item) => visitsOf(item, query)))).flat(),
    );
  }

  return visits;
};

/** Visits in the range, newest first. Dev builds use generated visits, as their profile is empty. */
export const searchVisits = async (query: VisitQuery) => {
  const visits = await (__MOCK_HISTORY__
    ? searchMockVisits(query)
    : searchBrowserVisits(query));

  return visits.sort((a, b) => b.time - a.time);
};
