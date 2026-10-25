import { describe, expect, test } from "bun:test";

import { mergeAdjacent, resizeSuggestion, setEdge } from "./resizeSuggestions";
import type { Suggestion } from "./suggestSlots";

const day = new Date(2026, 0, 5).getTime();
const at = (h: number, m = 0) => day + (h * 60 + m) * 60_000;
const block = (
  id: string,
  label: string,
  from: number,
  to: number,
): Suggestion => ({
  id,
  label,
  start: at(from),
  end: at(to),
  visitCount: 1,
  sources: [],
});

const list = () => [
  block("a", "AAA-1", 9, 10),
  block("b", "BBB-2", 10, 11),
  block("c", "CCC-3", 12, 13),
];
const ranges = (suggestions: Suggestion[]) =>
  suggestions.map((s) => [s.id, s.start, s.end]);

describe("setEdge", () => {
  test("extending into a neighbour trims it", () => {
    const result = setEdge(list(), "a", "end", at(10, 30), 15);

    expect(ranges(result)).toEqual([
      ["a", at(9), at(10, 30)],
      ["b", at(10, 30), at(11)],
      ["c", at(12), at(13)],
    ]);
  });

  test("covering a neighbour removes it", () => {
    const result = setEdge(list(), "c", "start", at(10), 15);

    expect(ranges(result)).toEqual([
      ["a", at(9), at(10)],
      ["c", at(10), at(13)],
    ]);
  });

  test("extending into empty time leaves the neighbours alone", () => {
    const result = setEdge(list(), "b", "end", at(12), 15);

    expect(ranges(result)).toEqual([
      ["a", at(9), at(10)],
      ["b", at(10), at(12)],
      ["c", at(12), at(13)],
    ]);
  });

  test("shrinking leaves empty time", () => {
    const result = setEdge(list(), "a", "end", at(9, 30), 15);

    expect(ranges(result)[0]).toEqual(["a", at(9), at(9, 30)]);
    expect(result).toHaveLength(3);
  });

  test("keeps at least one slot", () => {
    expect(ranges(setEdge(list(), "a", "end", at(8), 15))[0]).toEqual([
      "a",
      at(9),
      at(9, 15),
    ]);
    expect(ranges(setEdge(list(), "a", "start", at(11), 15))[0]).toEqual([
      "a",
      at(9, 45),
      at(10),
    ]);
  });

  test("an unknown id changes nothing", () => {
    expect(setEdge(list(), "x", "end", at(12), 15)).toEqual(list());
  });
});

describe("resizeSuggestion", () => {
  test("snaps to the slot of the time, which ends up inside", () => {
    const end = resizeSuggestion(list(), "a", "end", at(10, 20), 15)[0];
    const start = resizeSuggestion(list(), "c", "start", at(11, 40), 15).at(
      -1,
    )!;

    expect(end.end).toBe(at(10, 30));
    expect(start.start).toBe(at(11, 30));
  });
});

describe("mergeAdjacent", () => {
  test("joins neighbours of the same ticket", () => {
    const merged = mergeAdjacent([
      block("a", "AAA-1", 9, 10),
      block("b", "AAA-1", 10, 11),
      block("c", "AAA-1", 12, 13),
    ]);

    expect(ranges(merged)).toEqual([
      ["a", at(9), at(11)],
      ["c", at(12), at(13)],
    ]);
  });
});
