import { useCallback, useEffect, useState } from "react";
import { storage } from "webextension-polyfill";

import type { Suggestion } from "@/src/services/suggestions/suggestSlots";

const storageKey = "suggestionEdits";

/** A day's start (epoch ms) to the suggestions as the user left them. */
export type SuggestionEdits = Record<string, Suggestion[]>;

/** The days whose suggestions were resized by hand, kept in `storage.local`. */
export const useSuggestionEdits = () => {
  const [edits, setEdits] = useState<SuggestionEdits>({});

  useEffect(() => {
    storage.local.get(storageKey).then((items) => {
      setEdits((items[storageKey] as SuggestionEdits | undefined) ?? {});
    });
  }, []);

  /** Saves a day's suggestions; `undefined` goes back to the automatic ones. */
  const setEdit = useCallback((day: number, suggestions?: Suggestion[]) => {
    setEdits((current) => {
      const { [day]: _, ...rest } = current;
      const next = suggestions ? { ...rest, [day]: suggestions } : rest;
      storage.local.set({ [storageKey]: next });
      return next;
    });
  }, []);

  return { edits, setEdit };
};
