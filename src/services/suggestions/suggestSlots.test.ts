import { describe, expect, test } from "bun:test";

import type { Visit } from "@/src/services/history/types";
import {
  defaultSuggestionSettings,
  normalizeSite,
  slotRange,
  suggestSlots as suggest,
} from "./suggestSlots";

const ticketSites = [
  "jira.example",
  "x.example",
  "atlassian.net",
  "gitlab.com",
  "github.com",
  "wiki.example",
  "example.com",
];
const suggestSlots = (visits: Visit[], sites = ticketSites) =>
  suggest(visits, { ...defaultSuggestionSettings, ticketSites: sites });

const day = new Date(2026, 0, 5).getTime();
const at = (h: number, m: number) => day + (h * 60 + m) * 60_000;
const visit = (h: number, m: number, title: string, url: string): Visit => ({
  id: `${url}@${h}:${m}`,
  url,
  title,
  time: at(h, m),
});

describe("slotRange", () => {
  test("rounds out to whole slots", () => {
    const { from, to } = slotRange(at(9, 7), at(9, 31), 15);

    expect([from, to]).toEqual([at(9, 0), at(9, 45)]);
  });

  test("a single moment covers its slot", () => {
    const { from, to } = slotRange(at(9, 15), at(9, 15), 15);

    expect([from, to]).toEqual([at(9, 15), at(9, 30)]);
  });
});

describe("suggestSlots", () => {
  test("suggests only slots with a ticket, and merges neighbours", () => {
    const jira = "https://jira.example/browse/ABC-123";
    const visits = [
      visit(9, 0, "ABC-123 Fix login", jira),
      visit(9, 5, "ABC-123 Fix login", jira),
      visit(9, 30, "PR #4", "https://github.com/o/r/pull/4"),
      visit(9, 40, "PR #4", "https://github.com/o/r/pull/4"),
      visit(9, 50, "end", "https://end.example/"),
    ];
    const result = suggestSlots(visits);

    expect(result.map((s) => [s.label, (s.end - s.start) / 60_000])).toEqual([
      ["ABC-123", 15],
    ]);
  });

  test("finds keys in branches, merge request titles and lowercase URLs", () => {
    const at0 = (title: string, url: string) =>
      suggestSlots([
        visit(9, 0, title, url),
        visit(9, 10, "end", "https://end.example/"),
        visit(9, 20, "end", "https://end.example/"),
      ])[0]?.label;

    expect(
      at0(
        "Merge requests",
        "https://gitlab.com/g/p/-/tree/feature/ref-123-fix",
      ),
    ).toBe("REF-123");
    expect(
      at0(
        "REF-45: Add login (!12) · Merge requests",
        "https://gitlab.com/g/p/-/merge_requests/12",
      ),
    ).toBe("REF-45");
    expect(
      at0("Board", "https://x.atlassian.net/jira/software?selectedIssue=REF-7"),
    ).toBe("REF-7");
    expect(
      at0("Notes", "https://wiki.example/pages/12/scary-numbers-bin-4"),
    ).toBeUndefined();
    expect(
      at0("Charset utf-8 guide", "https://example.com/utf-8"),
    ).toBeUndefined();
  });

  test("pages near a ticket page count for the ticket", () => {
    const visits = [
      visit(9, 0, "Stack Overflow", "https://stackoverflow.com/q/1"),
      visit(9, 4, "REF-9 Fix", "https://x.atlassian.net/browse/REF-9"),
      visit(9, 8, "MDN docs", "https://developer.mozilla.org/x"),
      visit(9, 14, "other", "https://other.example/"),
    ];
    const [first] = suggestSlots(visits);

    expect(first.label).toBe("REF-9");
    expect(first.sources).toEqual(["x.atlassian.net"]);
  });

  test("a gap longer than the dwell cap leaves slots empty", () => {
    const visits = [
      visit(9, 0, "ABC-1 a", "https://x.example/a"),
      visit(11, 0, "ABC-1 a", "https://x.example/a"),
      visit(11, 5, "ABC-1 a", "https://x.example/a"),
    ];
    const result = suggestSlots(visits);

    expect(result).toHaveLength(2);
    expect(result[0].end - result[0].start).toBe(15 * 60_000);
  });

  test("keys are only looked for on the ticket sites, and their subdomains", () => {
    const visits = [
      visit(9, 0, "REF-1 Fix", "https://jira.example/browse/REF-1"),
      visit(9, 10, "end", "https://end.example/"),
      visit(9, 20, "end", "https://end.example/"),
    ];

    expect(suggestSlots(visits, ["jira.example"])[0]?.label).toBe("REF-1");
    expect(suggestSlots(visits, ["other.example"])).toEqual([]);
    expect(suggestSlots(visits, [])).toEqual([]);
    expect(
      suggestSlots(
        [
          visit(9, 0, "REF-1 Fix", "https://team.jira.example/browse/REF-1"),
          ...visits.slice(1),
        ],
        ["jira.example"],
      )[0]?.label,
    ).toBe("REF-1");
  });

  test("brief browsing below the minimum is dropped", () => {
    expect(suggestSlots([visit(9, 0, "a", "https://a.example/")])).toEqual([]);
  });
});

describe("normalizeSite", () => {
  test("reduces what the user typed to a host", () => {
    expect(normalizeSite("https://www.Jira.Example.com/browse/X-1")).toBe(
      "jira.example.com",
    );
    expect(normalizeSite("  gitlab.com ")).toBe("gitlab.com");
    expect(normalizeSite("")).toBe("");
    expect(normalizeSite("not a site")).toBe("");
  });
});
