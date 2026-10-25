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

/** mulberry32: a small seeded PRNG, so the mock history is the same on every reload. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const generate = (): Visit[] => {
  const random = seeded(42);
  const today = startOfDay(new Date());
  const now = Date.now();
  const visits: Visit[] = [];

  for (let back = 0; back < days; back++) {
    const day = addDays(today, -back);
    const weekend = [0, 6].includes(day.getDay());
    const count = weekend
      ? 5 + Math.floor(random() * 10)
      : 45 + Math.floor(random() * 40);

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
      if (time > now) continue;

      const site = sites[Math.floor(random() ** 1.6 * sites.length)];
      const n = site.ids
        ? site.ids[0] + Math.floor(random() * (site.ids[1] - site.ids[0]))
        : 0;
      const fill = (text: string) => text.replaceAll("{n}", String(n));
      const url = fill(site.url);

      visits.push({ id: `${url}@${time}`, url, title: fill(site.title), time });
    }
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
