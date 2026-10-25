import type { Page } from "playwright";

export type Scene = {
  id: string;
  /** Two lines; the second is drawn in the accent colour. */
  headline: [string, string];
  /** Whether the ticket suggestions are shown beside the visits. */
  suggestions: boolean;
  dark?: boolean;
  /** Frame backdrop: a file name in `backdrops/`. */
  backdrop: "light" | "dark";
  setup?: (page: Page) => Promise<void>;
};

export const scenes: Scene[] = [
  {
    id: "history",
    headline: ["Your browser history,", "finally easy to browse."],
    suggestions: false,
    backdrop: "light",
  },
  {
    id: "suggestions",
    headline: ["Turn your browsing", "into a timesheet."],
    suggestions: true,
    backdrop: "light",
  },
  {
    id: "dark",
    headline: ["Easy on the eyes,", "day and night."],
    suggestions: true,
    dark: true,
    backdrop: "dark",
  },
];
