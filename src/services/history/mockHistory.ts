import {
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from "date-fns";

import type { Visit, VisitQuery } from "./types";

const days = 30;

/** `{n}` in `url` and `title` is filled with a number from `ids`, making each visit a different page. */
type Site = { url: string; title: string; ids?: [number, number] };

/**
 * The browsing of an innie on the Macrodata Refinement team at Lumon Industries
 * (fictional `.example` sites), plus the odd real, generic site. The most-visited come first.
 */
const sites: Site[] = [
  {
    url: "https://mdr.lumon.example/files/dranesville/{n}",
    title: "Dranesville · Refinement queue · Lumon",
    ids: [1, 60],
  },
  {
    url: "https://mdr.lumon.example/bins/{n}",
    title: "Bin {n} · Scary numbers sort · Lumon",
    ids: [1, 5],
  },
  {
    url: "https://mdr.lumon.example/files/cold-harbor",
    title: "Cold Harbor · Refinement file · Lumon",
  },
  {
    url: "https://mdr.lumon.example/progress",
    title: "Quarterly refinement progress · Macrodata Refinement",
  },
  {
    url: "https://intranet.lumon.example/handbook/{n}",
    title: "The Handbook · Verse {n} · Lumon Intranet",
    ids: [1, 24],
  },
  {
    url: "https://intranet.lumon.example/wellness",
    title: "Wellness session sign-up · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/waffle-party",
    title: "Waffle party: am I eligible? · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/music-dance-experience",
    title: "Music Dance Experience request form · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/break-room/incidents",
    title: "Break room incident report · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/finger-traps",
    title: "Finger trap catalogue · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/perpetuity-wing",
    title: "Perpetuity Wing: visiting hours · Lumon Intranet",
  },
  {
    url: "https://intranet.lumon.example/eagan-quotes/{n}",
    title: "Founder's quotes, no. {n} · Lumon Intranet",
    ids: [1, 40],
  },
  { url: "https://en.wikipedia.org/wiki/Waffle", title: "Waffle - Wikipedia" },
  { url: "https://en.wikipedia.org/wiki/Goat", title: "Goat - Wikipedia" },
  {
    url: "https://en.wikipedia.org/wiki/Chinese_finger_trap",
    title: "Chinese finger trap - Wikipedia",
  },
  {
    url: "https://duckduckgo.com/?q=numbers+that+feel+scary+{n}",
    title: "numbers that feel scary at DuckDuckGo",
    ids: [1, 12],
  },
  { url: "https://www.reddit.com/r/ergonomics/", title: "r/ergonomics" },
  {
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    title: "Calm music for focus, 10 hours - YouTube",
  },
  {
    url: "https://weather.com/weather/today/l/kier",
    title: "Weather forecast for Kier, PA - weather.com",
  },
  {
    url: "https://www.amazon.com/s?k=desk+plant+low+light",
    title: "Amazon.com: desk plant low light",
  },
];

type Ticket = {
  key: string;
  summary: string;
  /** Used in branch names and page paths. */
  slug: string;
  /** Where its code lives. */
  host: "gitlab" | "github";
};

/** What the innie is working on; each day draws a few of these. */
const tickets: Ticket[] = [
  {
    key: "MDR-142",
    summary: "Refine Dranesville queue throughput",
    slug: "dranesville-queue",
    host: "gitlab",
  },
  {
    key: "MDR-157",
    summary: "Scary numbers misclassified in bin 4",
    slug: "scary-numbers-bin-4",
    host: "gitlab",
  },
  {
    key: "MDR-163",
    summary: "Cold Harbor export times out",
    slug: "cold-harbor-export",
    host: "gitlab",
  },
  {
    key: "WLN-23",
    summary: "Wellness session sign-up fails for outies",
    slug: "wellness-signup",
    host: "github",
  },
  {
    key: "HBK-31",
    summary: "Add verse 25 to the Handbook",
    slug: "handbook-verse-25",
    host: "github",
  },
  {
    key: "OTC-9",
    summary: "Paginate the finger trap catalogue",
    slug: "finger-trap-pagination",
    host: "github",
  },
  {
    key: "BRK-5",
    summary: "Break room incident form validation",
    slug: "incident-form-validation",
    host: "gitlab",
  },
];

type Page = { url: string; title: string };

/**
 * The pages a ticket's work visits, like real ones: some name the ticket in the
 * title, some only in the URL, and some not at all (the code, the docs, the CI).
 * Each has a weight for how often it comes up in a session.
 */
const workPages: {
  weight: number;
  page: (ticket: Ticket, n: number) => Page;
}[] = [
  {
    weight: 4,
    page: ({ key, summary }) => ({
      url: `https://lumon.atlassian.net/browse/${key}`,
      title: `[${key}] ${summary} - Jira`,
    }),
  },
  {
    // The key is only in the URL.
    weight: 2,
    page: ({ key }) => ({
      url: `https://lumon.atlassian.net/jira/software/projects/${key.split("-")[0]}/boards/1?selectedIssue=${key}`,
      title: "Macrodata Refinement board - Jira",
    }),
  },
  {
    // The key is only in the title.
    weight: 3,
    page: ({ key, slug }, n) => ({
      url: `https://lumon.atlassian.net/wiki/spaces/${key.split("-")[0]}/pages/${100000 + n * 7}/${slug}`,
      title: `${key} design notes - Macrodata Refinement - Confluence`,
    }),
  },
  {
    // A page of the team's own, which names no ticket at all.
    weight: 1,
    page: (_, n) => ({
      url: `https://lumon.atlassian.net/wiki/spaces/MDR/pages/${200000 + (n % 4)}/refinement-runbook`,
      title: "Refinement runbook - Macrodata Refinement - Confluence",
    }),
  },
  {
    weight: 4,
    page: ({ key, summary, host }, n) =>
      host === "gitlab"
        ? {
            url: `https://gitlab.com/lumon-industries/refiner/-/merge_requests/${40 + (n % 30)}`,
            title: `${key}: ${summary} (!${40 + (n % 30)}) · Merge requests · Lumon / Refiner · GitLab`,
          }
        : {
            url: `https://github.com/lumon-industries/handbook-web/pull/${40 + (n % 30)}`,
            title: `${key} ${summary} by kier-eagan · Pull Request #${40 + (n % 30)} · lumon-industries/handbook-web`,
          },
  },
  {
    // A merge request whose title doesn't carry the key.
    weight: 1,
    page: ({ host }, n) =>
      host === "gitlab"
        ? {
            url: `https://gitlab.com/lumon-industries/refiner/-/merge_requests/${70 + (n % 20)}/diffs`,
            title: `Draft: tidy sorting (!${70 + (n % 20)}) · Changes · Lumon / Refiner · GitLab`,
          }
        : {
            url: `https://github.com/lumon-industries/handbook-web/pull/${70 + (n % 20)}/files`,
            title: `Tidy sorting by kier-eagan · Pull Request #${70 + (n % 20)} · lumon-industries/handbook-web`,
          },
  },
  {
    // The branch is in the URL, in lowercase.
    weight: 3,
    page: ({ key, slug, host }) =>
      host === "gitlab"
        ? {
            url: `https://gitlab.com/lumon-industries/refiner/-/blob/feature/${key.toLowerCase()}-${slug}/src/refine.ts`,
            title: `src/refine.ts · feature/${key.toLowerCase()}-${slug} · Lumon / Refiner · GitLab`,
          }
        : {
            url: `https://github.com/lumon-industries/handbook-web/blob/${key.toLowerCase()}-${slug}/src/verse.tsx`,
            title: `handbook-web/src/verse.tsx at ${key.toLowerCase()}-${slug} · lumon-industries/handbook-web`,
          },
  },
  {
    // Code and CI with nothing of the ticket in them.
    weight: 3,
    page: ({ host }, n) =>
      host === "gitlab"
        ? {
            url: `https://gitlab.com/lumon-industries/refiner/-/pipelines/${9000 + n}`,
            title: `Pipeline #${9000 + n} · Pipelines · Lumon / Refiner · GitLab`,
          }
        : {
            url: `https://github.com/lumon-industries/handbook-web/actions/runs/${5000 + n}`,
            title: `CI · Run ${5000 + n} · lumon-industries/handbook-web`,
          },
  },
  {
    weight: 2,
    page: (_, n) => ({
      url: `https://stackoverflow.com/questions/${4100000 + n}`,
      title:
        "javascript - How to sort numbers by how they make you feel - Stack Overflow",
    }),
  },
  {
    weight: 2,
    page: () => ({
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
      title: "Array.prototype.sort() - JavaScript | MDN",
    }),
  },
  {
    weight: 1,
    page: () => ({
      url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      title: "TypeScript: Documentation - Generics",
    }),
  },
];

/** mulberry32: a small seeded PRNG, so the mock history is the same on every reload. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A visit to one of the everyday sites, which most of the browsing is. */
const noiseVisit = (random: () => number, time: number): Visit => {
  const site = sites[Math.floor(random() ** 1.6 * sites.length)];
  const n = site.ids
    ? site.ids[0] + Math.floor(random() * (site.ids[1] - site.ids[0]))
    : 0;
  const fill = (text: string) => text.replaceAll("{n}", String(n));
  const url = fill(site.url);

  return { id: `${url}@${time}`, url, title: fill(site.title), time };
};

const pickWorkPage = (random: () => number) => {
  const total = workPages.reduce((sum, { weight }) => sum + weight, 0);
  let roll = random() * total;

  return (workPages.find(({ weight }) => (roll -= weight) < 0) ?? workPages[0])
    .page;
};

const minute = 60_000;

/**
 * Stretches of work on one ticket: a Jira page first, then a random walk over
 * its pages a few minutes apart, with the odd everyday site slipped in.
 */
const workSessions = (
  random: () => number,
  day: Date,
  back: number,
): Visit[] => {
  const visits: Visit[] = [];
  let cursor = 9 * 60 + Math.floor(random() * 40);

  for (let session = 0; cursor < 17 * 60 + 30; session++) {
    // Tickets run for days: today's three or four are the same ones as yesterday's, shifted.
    const ticket =
      tickets[
        (Math.floor(back / 2) + Math.floor(random() * 4)) % tickets.length
      ];
    const length = 20 + Math.floor(random() * 80);
    const end = cursor + length;
    const n = Math.floor(random() * 30);
    let at = cursor;

    const first = workPages[0].page(ticket, n);
    for (let step = 0; at < end; step++) {
      const { url, title } =
        step === 0 ? first : pickWorkPage(random)(ticket, n + step);
      const time =
        startOfDay(day).getTime() +
        at * minute +
        Math.floor(random() * 50) * 1000;
      visits.push({ id: `${url}@${time}`, url, title, time });

      if (random() < 0.2) visits.push(noiseVisit(random, time + 30_000));

      at += 1 + Math.floor(random() ** 1.5 * 8);
    }

    // Lunch, a meeting, or just a pause.
    cursor = at + 5 + Math.floor(random() * 30);
    if (cursor > 11 * 60 + 45 && cursor < 12 * 60 + 30) cursor = 12 * 60 + 30;
  }

  return visits;
};

const generate = (): Visit[] => {
  const today = startOfDay(new Date());
  const visits: Visit[] = [];

  for (let back = 0; back < days; back++) {
    // Each day has its own seed and its kind follows from how far back it is, not
    // from the date or the time of day: the same day always looks the same, and today is a work day.
    const random = seeded(42 + back);
    const day = addDays(today, -back);
    const weekend = back % 7 >= 5;
    const count = weekend
      ? 5 + Math.floor(random() * 10)
      : 20 + Math.floor(random() * 20);

    for (let i = 0; i < count; i++) {
      // Work happens 8:30-18:00, with a few evening stragglers; weekends are late and light.
      const hour = weekend
        ? 10 + random() * 11
        : random() < 0.08
          ? 19 + random() * 4
          : 8.5 + random() * 9.5;
      const time = setSeconds(
        setMinutes(
          setHours(day, Math.floor(hour)),
          Math.floor((hour % 1) * 60),
        ),
        Math.floor(random() * 60),
      ).getTime();

      visits.push(noiseVisit(random, time));
    }

    if (!weekend) visits.push(...workSessions(random, day, back));
  }

  return visits;
};

/** Mirrors the browser search: matches on title and URL, within `start`-`end` (ms). */
export const searchMockVisits = async ({
  text = "",
  start,
  end,
}: VisitQuery): Promise<Visit[]> => {
  const needle = text.toLowerCase();

  return generate().filter(
    (visit) =>
      visit.time >= start &&
      visit.time < end &&
      `${visit.title} ${visit.url}`.toLowerCase().includes(needle),
  );
};
