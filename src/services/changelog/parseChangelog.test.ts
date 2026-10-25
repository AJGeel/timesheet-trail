import { describe, expect, test } from "bun:test";

import { parseReleaseNotes } from "./parseChangelog";

const changelog = `# Changelog

Timesheet Trail adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [V1.1.0] — 2026-11-01

### ✨ Added

- Something new

## [V1.0.0] — 2026-10-25

### ✨ Added

- First release
`;

describe("parseReleaseNotes", () => {
  test("returns the date and body of a version", () => {
    expect(parseReleaseNotes(changelog, "1.0.0")).toEqual({
      date: "2026-10-25",
      body: "### ✨ Added\n\n- First release",
    });
  });

  test("is undefined for a version without a section", () => {
    expect(parseReleaseNotes(changelog, "2.0.0")).toBeUndefined();
  });
});
