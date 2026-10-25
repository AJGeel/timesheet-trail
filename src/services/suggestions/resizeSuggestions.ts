import { slotRange, type Suggestion } from "./suggestSlots";

const minute = 60_000;

export type Edge = "start" | "end";

/**
 * Moves one edge of a suggestion to `boundary` (a slot boundary, epoch ms). The
 * suggestion keeps at least one slot, and the ones it now overlaps are trimmed,
 * or removed when nothing of them is left.
 */
export const setEdge = (
  suggestions: Suggestion[],
  id: string,
  edge: Edge,
  boundary: number,
  slotMinutes: number,
): Suggestion[] => {
  const target = suggestions.find((suggestion) => suggestion.id === id);
  if (!target) return suggestions;

  const slotMs = slotMinutes * minute;
  const start =
    edge === "start" ? Math.min(boundary, target.end - slotMs) : target.start;
  const end =
    edge === "end" ? Math.max(boundary, target.start + slotMs) : target.end;

  return suggestions
    .map((other): Suggestion | undefined => {
      if (other === target) return { ...target, start, end };
      if (other.end <= start || other.start >= end) return other;
      if (other.start >= start && other.end <= end) return undefined;
      // Overlapped on one side only, as the others don't overlap the target to begin with.
      return other.start < start
        ? { ...other, end: start }
        : { ...other, start: end };
    })
    .filter((suggestion) => suggestion !== undefined)
    .sort((a, b) => a.start - b.start);
};

/** Moves an edge to the slot that `time` falls in: the visit under the pointer ends up inside. */
export const resizeSuggestion = (
  suggestions: Suggestion[],
  id: string,
  edge: Edge,
  time: number,
  slotMinutes: number,
) => {
  const { from, to } = slotRange(time, time, slotMinutes);

  return setEdge(
    suggestions,
    id,
    edge,
    edge === "start" ? from : to,
    slotMinutes,
  );
};

/** Joins neighbouring suggestions of the same ticket, keeping the earlier one's id. */
export const mergeAdjacent = (suggestions: Suggestion[]) =>
  suggestions.reduce<Suggestion[]>((merged, suggestion) => {
    const previous = merged.at(-1);

    if (
      previous?.end === suggestion.start &&
      previous.label === suggestion.label
    ) {
      merged[merged.length - 1] = {
        ...previous,
        end: suggestion.end,
        sources: [...new Set([...previous.sources, ...suggestion.sources])],
      };
    } else {
      merged.push(suggestion);
    }
    return merged;
  }, []);
