import { useEffect, useState } from "react";
import { commands } from "webextension-polyfill";

import { shortcutKeys } from "@/src/services/shortcut";

const mac = /Mac/.test(navigator.platform);

/** The keys of the shortcut that opens the history, as the browser has it set: empty if none. */
export const useOpenShortcut = () => {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    commands.getAll().then((all) => {
      const command = all.find(({ name }) => name === "open-history");
      setKeys(shortcutKeys(command?.shortcut ?? "", mac));
    });
  }, []);

  return keys;
};
