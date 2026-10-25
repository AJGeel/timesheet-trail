import type { ReactNode } from "react";

import type { Visit } from "@/src/services/history/types";

/** A card shown beside the visits that fall in `[start, end)`. */
export type VisitAside = {
  key: string;
  start: number;
  end: number;
  content: ReactNode;
};

export type Placed = { aside: VisitAside; first: number; last: number };

/**
 * Where each aside goes: the grid rows of the visits inside it. One without a
 * visit of its own sits at the nearest visit, unless that row is taken.
 */
export const place = (asides: VisitAside[], rows: Map<Visit, number>) => {
  const placed: Placed[] = [];
  const taken = new Set<number>();
  const entries = [...rows];

  for (const aside of asides) {
    const inside = entries.filter(
      ([visit]) => visit.time >= aside.start && visit.time < aside.end,
    );
    const nearest = () =>
      [...entries].sort(
        (a, b) =>
          Math.abs(a[0].time - aside.start) - Math.abs(b[0].time - aside.start),
      )[0];
    const used = inside.length > 0 ? inside : [nearest()].filter(Boolean);
    if (used.length === 0) continue;

    const first = Math.min(...used.map(([, row]) => row));
    const last = Math.max(...used.map(([, row]) => row));
    const span = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    if (span.some((row) => taken.has(row))) continue;

    span.forEach((row) => taken.add(row));
    placed.push({ aside, first, last });
  }

  return placed;
};

export type Run = { first: number; last: number; visits: Visit[] };

/** The stretches of visits, newest first, whose rows no aside has taken. */
export const gaps = (rows: Map<Visit, number>, placed: Placed[]) => {
  const covered = (row: number) =>
    placed.some(({ first, last }) => row >= first && row <= last);
  const runs: Run[] = [];
  let run: Run | undefined;

  for (const [visit, row] of rows) {
    if (covered(row)) {
      run = undefined;
    } else if (run) {
      run.last = row;
      run.visits.push(visit);
    } else {
      run = { first: row, last: row, visits: [visit] };
      runs.push(run);
    }
  }

  return runs;
};
