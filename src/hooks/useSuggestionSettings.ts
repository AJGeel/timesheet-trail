import { useCallback, useEffect, useState } from "react";
import { storage } from "webextension-polyfill";

import {
  defaultSuggestionSettings,
  type SuggestionSettings,
} from "@/src/services/suggestions/suggestSlots";

const settingsKey = "suggestionSettings";
const shownKey = "suggestionsShown";

/** The suggestions' settings and whether they are shown, kept in `storage.local`. */
export const useSuggestionSettings = () => {
  const [settings, setSettings] = useState(defaultSuggestionSettings);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    storage.local.get([settingsKey, shownKey]).then((items) => {
      const saved = items[settingsKey] as
        Partial<SuggestionSettings> | undefined;
      setSettings({ ...defaultSuggestionSettings, ...saved });
      if (typeof items[shownKey] === "boolean") setShown(items[shownKey]);
    });
  }, []);

  const update = useCallback((change: Partial<SuggestionSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      storage.local.set({ [settingsKey]: next });
      return next;
    });
  }, []);

  const toggleShown = useCallback(() => {
    setShown((current) => {
      storage.local.set({ [shownKey]: !current });
      return !current;
    });
  }, []);

  return { settings, update, shown, toggleShown };
};
