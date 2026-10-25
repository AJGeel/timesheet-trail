import { describe, expect, test } from "bun:test";

import { gaps, place, type VisitAside } from "./placeAsides";
import type { Visit } from "./types";

const visit = (id: string, time: number): Visit => ({
  id,
  url: `https://example.com/${id}`,
  title: id,
  time,
});
const aside = (key: string, start: number, end: number): VisitAside => ({
  key,
  start,
  end,
  content: null,
});
/** Rows as VisitList numbers them: a heading takes row 1, so visits start at 2. */
const rowsOf = (visits: Visit[]) =>
  new Map(visits.map((v, i) => [v, i + 2] as const));

const a = visit("a", 100);
const b = visit("b", 200);
const c = visit("c", 300);
const d = visit("d", 400);
const rows = rowsOf([a, b, c, d]);

const spans = (asides: VisitAside[], map = rows) =>
  place(asides, map).map(({ aside: { key }, first, last }) => [
    key,
    first,
    last,
  ]);

describe("place", () => {
  test("spans the rows of the visits inside the range", () => {
    expect(spans([aside("x", 100, 300)])).toEqual([["x", 2, 3]]);
  });

  test("includes the start and excludes the end of the range", () => {
    expect(spans([aside("x", 200, 300)])).toEqual([["x", 3, 3]]);
  });

  test("puts an aside without visits at the nearest visit", () => {
    expect(spans([aside("x", 330, 340)])).toEqual([["x", 4, 4]]);
  });

  test("drops an aside whose rows are taken", () => {
    expect(
      spans([aside("x", 100, 300), aside("y", 150, 250), aside("z", 300, 500)]),
    ).toEqual([
      ["x", 2, 3],
      ["z", 4, 5],
    ]);
  });

  test("places nothing when there are no visits", () => {
    expect(spans([aside("x", 0, 1000)], new Map())).toEqual([]);
  });
});

describe("gaps", () => {
  test("returns every visit as one run when nothing is placed", () => {
    expect(gaps(rows, [])).toEqual([
      { first: 2, last: 5, visits: [a, b, c, d] },
    ]);
  });

  test("returns the stretches between placed asides", () => {
    const placed = place([aside("x", 200, 300)], rows);

    expect(gaps(rows, placed)).toEqual([
      { first: 2, last: 2, visits: [a] },
      { first: 4, last: 5, visits: [c, d] },
    ]);
  });

  test("returns nothing when asides cover every visit", () => {
    const placed = place([aside("x", 0, 1000)], rows);

    expect(gaps(rows, placed)).toEqual([]);
  });
});
