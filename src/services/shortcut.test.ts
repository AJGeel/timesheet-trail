import { describe, expect, test } from "bun:test";

import { keyName, shortcutKeys } from "./shortcut";

describe("shortcutKeys", () => {
  test("Firefox on a Mac", () => {
    expect(shortcutKeys("MacCtrl+Shift+H", true)).toEqual(["⌃", "⇧", "H"]);
    expect(shortcutKeys("Alt+Shift+H", true)).toEqual(["⌥", "⇧", "H"]);
    expect(shortcutKeys("Ctrl+Y", true)).toEqual(["⌘", "Y"]);
  });

  test("Chrome on a Mac writes symbols", () => {
    expect(shortcutKeys("⇧⌘Y", true)).toEqual(["⇧", "⌘", "Y"]);
    expect(shortcutKeys("⌘Y", true)).toEqual(["⌘", "Y"]);
  });

  test("Windows and Linux keep the words", () => {
    expect(shortcutKeys("Alt+Shift+H", false)).toEqual(["Alt", "Shift", "H"]);
    expect(shortcutKeys("Ctrl+Y", false)).toEqual(["Ctrl", "Y"]);
  });

  test("no shortcut gives no keys", () => {
    expect(shortcutKeys("", true)).toEqual([]);
  });
});

describe("keyName", () => {
  test("spells out the Mac symbols", () => {
    expect(["⌃", "⌥", "⇧", "⌘"].map(keyName)).toEqual([
      "Control",
      "Option",
      "Shift",
      "Command",
    ]);
  });

  test("leaves other keys as they are", () => {
    expect(keyName("H")).toBe("H");
    expect(keyName("Shift")).toBe("Shift");
  });
});
