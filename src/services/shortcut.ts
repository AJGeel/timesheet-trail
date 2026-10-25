/** The order Mac shows modifiers in. */
const macOrder = ["⌃", "⌥", "⇧", "⌘"];

const macSymbols: Record<string, string> = {
  macctrl: "⌃",
  ctrl: "⌘", // Firefox's "Ctrl" is Command on a Mac.
  command: "⌘",
  alt: "⌥",
  shift: "⇧",
};

/**
 * The keys of a shortcut as the browser reports it, one label each, as the platform
 * writes them: Firefox gives `MacCtrl+Shift+H`, Chrome gives `Ctrl+Y` or, on a Mac,
 * `⇧⌘Y`. Empty if there is no shortcut.
 */
export const shortcutKeys = (shortcut: string, mac: boolean) => {
  if (!shortcut) return [];

  // Chrome on a Mac already writes symbols, without separators.
  const parts = shortcut.includes("+") ? shortcut.split("+") : [...shortcut];
  const keys = parts.map((part) =>
    mac ? (macSymbols[part.toLowerCase()] ?? part) : part,
  );

  if (!mac) return keys;

  // Modifiers first, in the Mac order, then the key.
  const modifiers = keys
    .filter((key) => macOrder.includes(key))
    .sort((a, b) => macOrder.indexOf(a) - macOrder.indexOf(b));
  return [...modifiers, ...keys.filter((key) => !macOrder.includes(key))];
};

const macNames: Record<string, string> = {
  "⌃": "Control",
  "⌥": "Option",
  "⇧": "Shift",
  "⌘": "Command",
};

/** What to call a key out loud: `⌃` is Control. Other keys are their own name. */
export const keyName = (key: string) => macNames[key] ?? key;
