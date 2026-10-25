import type { Visit } from "@/src/services/history/types";

import { ticketKeyOf } from "./ticketKey";

export type SuggestionSettings = {
  /** Length of a timesheet slot; should divide 60. */
  slotMinutes: number;
  /** A visit counts for at most this long, as history has no time-on-page. */
  maxDwellMinutes: number;
  /** A slot with less browsing than this is left empty. */
  minActiveMinutes: number;
  /**
   * The sites that hold ticket content (Jira, GitLab, ...): a ticket key is only
   * looked for on these. A site covers its subdomains.
   */
  ticketSites: string[];
};

export const defaultSuggestionSettings: SuggestionSettings = {
  slotMinutes: 15,
  maxDwellMinutes: 10,
  minActiveMinutes: 3,
  ticketSites: [
    "atlassian.net",
    "atlassian.com",
    "gitlab.com",
    "github.com",
    "bitbucket.org",
    "linear.app",
  ],
};

export type Suggestion = {
  /** Stays the same when the suggestion is resized, unlike `start`. */
  id: string;
  /** Epoch ms, on a slot boundary. */
  start: number;
  /** Epoch ms, exclusive. */
  end: number;
  /** The ticket key. */
  label: string;
  /** Visits that start inside the suggestion. */
  visitCount: number;
  /** For a ticket: the hosts of pages that name it, most dwell first. */
  sources: string[];
};

const minute = 60_000;
/** A ticket wins a slot when its share of the slot's browsing is at least this. */
const ticketShare = 0.3;
/** A page that doesn't name a ticket, but sits next to one that does, counts this much. */
const relatedWeight = 0.5;

/** Local time is what slots are cut from, so they start on the user's own quarter hours. */
const localShift = (time: number) =>
  -new Date(time).getTimezoneOffset() * minute;

/** The slots that `[start, end]` touches, as the one range `[from, to)`. */
export const slotRange = (start: number, end: number, slotMinutes: number) => {
  const slotMs = slotMinutes * minute;
  const shift = localShift(start);

  return {
    from: Math.floor((start + shift) / slotMs) * slotMs - shift,
    to: (Math.floor((end + shift) / slotMs) + 1) * slotMs - shift,
  };
};

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** `https://www.Jira.example.com/browse/X` or `jira.example.com` as `jira.example.com`; empty if it isn't a site. */
export const normalizeSite = (input: string) => {
  const text = input.trim().toLowerCase();
  if (!text) return "";

  try {
    const host = new URL(text.includes("://") ? text : `https://${text}`)
      .hostname;
    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isTicketSite = (host: string, sites: string[]) =>
  sites.some((site) => host === site || host.endsWith(`.${site}`));

type Weights = Map<string, number>;

const add = (weights: Weights, label: string, ms: number) =>
  weights.set(label, (weights.get(label) ?? 0) + ms);

const ranked = (weights: Weights | undefined) =>
  [...(weights ?? [])].sort((a, b) => b[1] - a[1]).map(([label]) => label);

type Counted = {
  visit: Visit;
  host: string;
  dwell: number;
  /** Named by the page itself. */
  key?: string;
  /** Taken from a neighbouring page: this one doesn't name a ticket. */
  related?: string;
};

/**
 * Pages that don't name a ticket (code, docs, a search) usually belong to the
 * ticket being worked on, so they take the key of the nearest page within
 * `reach` that does, the earlier one on a tie.
 */
const relate = (counted: Counted[], reach: number) => {
  const keyed = counted.filter(({ key }) => key);

  for (const item of counted) {
    if (item.key) continue;

    let best: Counted | undefined;
    for (const other of keyed) {
      const distance = Math.abs(other.visit.time - item.visit.time);
      if (distance > reach) continue;

      const bestDistance = best
        ? Math.abs(best.visit.time - item.visit.time)
        : Infinity;
      const earlier = other.visit.time < item.visit.time;
      if (distance < bestDistance || (distance === bestDistance && earlier)) {
        best = other;
      }
    }
    item.related = best?.key;
  }
};

/**
 * Suggests what to write time on for one day: browsing is spread over the day's
 * slots, each slot is named by its dominant ticket, and neighbouring slots with
 * the same ticket are merged. A slot without a clear ticket gets no suggestion.
 *
 * A visit lasts until the next visit, capped at `maxDwellMinutes`. A ticket is
 * named by a page that mentions its key (see `ticketKeyOf`); pages near it
 * count for it too, at half weight.
 */
export const suggestSlots = (
  visits: Visit[],
  settings: SuggestionSettings = defaultSuggestionSettings,
): Suggestion[] => {
  const slotMs = settings.slotMinutes * minute;
  const shift = localShift(visits[0]?.time ?? 0);
  const slotStart = (slot: number) => slot * slotMs - shift;
  const maxDwell = settings.maxDwellMinutes * minute;
  const sorted = [...visits].sort((a, b) => a.time - b.time);

  const counted: Counted[] = [];
  sorted.forEach((visit, i) => {
    const host = hostOf(visit.url);

    const next = sorted[i + 1];
    const dwell = Math.min(next ? next.time - visit.time : minute, maxDwell);
    counted.push({
      visit,
      host,
      dwell,
      key: isTicketSite(host, settings.ticketSites)
        ? ticketKeyOf(visit)
        : undefined,
    });
  });
  relate(counted, maxDwell);

  const tickets = new Map<number, Weights>();
  /** Per slot and ticket, the hosts of the pages that name it. */
  const evidence = new Map<number, Map<string, Weights>>();
  const total = new Map<number, number>();
  const counts = new Map<number, number>();

  for (const { visit, host, dwell, key, related } of counted) {
    const label = key ?? related;
    const weight = key ? 1 : relatedWeight;

    const firstSlot = Math.floor((visit.time + shift) / slotMs);
    counts.set(firstSlot, (counts.get(firstSlot) ?? 0) + 1);

    // Spread the dwell over the slots it overlaps.
    const end = visit.time + dwell;
    for (let slot = firstSlot; slotStart(slot) < end; slot++) {
      const overlap =
        Math.min(end, slotStart(slot + 1)) -
        Math.max(visit.time, slotStart(slot));
      if (overlap <= 0) continue;

      total.set(slot, (total.get(slot) ?? 0) + overlap);

      if (label) {
        if (!tickets.has(slot)) tickets.set(slot, new Map());
        add(tickets.get(slot)!, label, overlap * weight);
      }
      if (key) {
        if (!evidence.has(slot)) evidence.set(slot, new Map());
        const byTicket = evidence.get(slot)!;
        if (!byTicket.has(key)) byTicket.set(key, new Map());
        add(byTicket.get(key)!, host, overlap);
      }
    }
  }

  const suggestions: Suggestion[] = [];
  const slots = [...total.keys()].sort((a, b) => a - b);

  for (const slot of slots) {
    const slotTotal = total.get(slot)!;
    if (slotTotal < settings.minActiveMinutes * minute) continue;

    // A slot without a clear ticket gets no suggestion.
    const [label] = ranked(tickets.get(slot));
    if (!label) continue;
    if (tickets.get(slot)!.get(label)! < slotTotal * ticketShare) continue;

    const start = slotStart(slot);
    const sources = ranked(evidence.get(slot)?.get(label));
    const previous = suggestions.at(-1);

    if (previous && previous.end === start && previous.label === label) {
      previous.end = start + slotMs;
      previous.visitCount += counts.get(slot) ?? 0;
      previous.sources = [...new Set([...previous.sources, ...sources])];
    } else {
      suggestions.push({
        id: String(start),
        start,
        end: start + slotMs,
        label,
        visitCount: counts.get(slot) ?? 0,
        sources,
      });
    }
  }

  return suggestions;
};
