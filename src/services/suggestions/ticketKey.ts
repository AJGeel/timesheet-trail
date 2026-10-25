import type { Visit } from "@/src/services/history/types";

/** `REF-123`: a project key and a number, not glued to other letters or digits. */
const upperKey = /(?<![A-Za-z0-9])[A-Z][A-Z0-9]{1,9}-\d{1,6}(?![A-Za-z0-9])/;
/**
 * Branch names are often lowercase (`feature/ref-123-fix-login`). It must start a
 * path segment, as inside a slug (`design-notes-for-bin-4`) it is just words.
 */
const anyCaseKey =
  /(?<![A-Za-z0-9\-_])[A-Za-z][A-Za-z0-9]{1,9}-\d{1,6}(?![A-Za-z0-9])/;

/** Look like ticket keys but aren't. */
const notProjects = new Set([
  "UTF",
  "ISO",
  "SHA",
  "MD",
  "RFC",
  "COVID",
  "HTTP",
  "HTTPS",
  "CVE",
  "ES",
  "ECMA",
  "WCAG",
  "IPV",
  "X",
  "ASCII",
  "TLS",
  "SSL",
  "AES",
  "RSA",
  "PDF",
  "JSON",
  "CSS",
  "HTML",
  "H",
  "A",
]);

const find = (text: string, pattern: RegExp) => {
  const key = text.match(pattern)?.[0].toUpperCase();
  return key && !notProjects.has(key.split("-")[0]) ? key : undefined;
};

const decoded = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

/**
 * The ticket a visit is about, if it names one. The URL goes first, since it
 * carries Jira's `/browse/REF-123`, board `selectedIssue=REF-123` and the
 * branch of a GitLab/GitHub merge request or compare page; then the title, which
 * carries the key of a Confluence page, a merge request or a commit.
 */
export const ticketKeyOf = ({ url, title }: Pick<Visit, "url" | "title">) => {
  let address = url;
  try {
    const { pathname, search, hash } = new URL(url);
    address = decoded(pathname + search + hash);
  } catch {
    // Not a URL we can take apart: the whole text will do.
  }

  return find(address, anyCaseKey) ?? find(title, upperKey);
};
