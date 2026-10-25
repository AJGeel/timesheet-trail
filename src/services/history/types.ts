/** One visit to a page. */
export type Visit = {
  id: string;
  url: string;
  title: string;
  /** Epoch ms. */
  time: number;
};

export type VisitQuery = {
  /** Matched against title and URL; empty matches everything. */
  text?: string;
  /** Epoch ms, inclusive. */
  start: number;
  /** Epoch ms, exclusive. */
  end: number;
};
