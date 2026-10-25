import { describe, expect, test } from "bun:test";

import { ticketKeyOf } from "./ticketKey";

const keyOf = (url: string, title = "") => ticketKeyOf({ url, title });

describe("ticketKeyOf", () => {
  test("reads a Jira issue page", () => {
    expect(keyOf("https://acme.atlassian.net/browse/REF-123")).toBe("REF-123");
  });

  test("reads a board's selected issue", () => {
    expect(keyOf("https://acme.atlassian.net/board?selectedIssue=REF-45")).toBe(
      "REF-45",
    );
  });

  test("reads a lowercase branch name and uppercases it", () => {
    expect(
      keyOf("https://gitlab.com/acme/app/-/tree/feature/ref-123-fix-login"),
    ).toBe("REF-123");
  });

  test("reads an encoded branch name", () => {
    expect(
      keyOf("https://github.com/acme/app/compare/feature%2FREF-9-login"),
    ).toBe("REF-9");
  });

  test("ignores a key-like word inside a slug", () => {
    expect(keyOf("https://example.com/design-notes-for-bin-4")).toBeUndefined();
  });

  test("falls back to the title when the URL has no key", () => {
    expect(
      keyOf("https://acme.atlassian.net/wiki/pages/1", "REF-77 Release notes"),
    ).toBe("REF-77");
  });

  test("prefers the URL over the title", () => {
    expect(
      keyOf("https://acme.atlassian.net/browse/REF-1", "REF-2 Other"),
    ).toBe("REF-1");
  });

  test("skips things that only look like ticket keys", () => {
    expect(keyOf("https://example.com", "UTF-8 and SHA-256")).toBeUndefined();
  });

  test("does not match keys glued to other letters or digits", () => {
    expect(keyOf("https://example.com", "XREF-123Y")).toBeUndefined();
  });

  test("copes with text that is not a URL", () => {
    expect(keyOf("not a url REF-5")).toBe("REF-5");
  });
});
