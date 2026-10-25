import { format } from "date-fns";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import Favicon from "@/src/components/ui/Favicon";
import { cn } from "@/src/utils";
import {
  gaps,
  place,
  type VisitAside,
} from "@/src/services/history/placeAsides";
import type { Visit } from "@/src/services/history/types";

export type { VisitAside };

export type VisitGroup = {
  key: string;
  label: string;
  visits: Visit[];
  /** Element id, so the group can be scrolled to. */
  anchor?: string;
};

/** The URL without its scheme and `www.`, as it reads best in a list. */
const readable = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

/** The grid row, in the one column the visits take. */
const rowStyle = (gridRow: number): CSSProperties => ({
  gridColumn: 1,
  gridRow,
});

/** Fades and slides the asides in and out; quick, and none for those who ask for less motion. */
const asideMotion = (visible: boolean) =>
  cn(
    "transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none",
    // Clipped sideways only, so the resize handles of a shown card can stick out above and below.
    "overflow-x-clip",
    !visible && "pointer-events-none translate-x-4 opacity-0",
  );

type Props = {
  groups: VisitGroup[];
  /** Shown in a column beside the visits, each level with the visits it covers. */
  asides?: VisitAside[];
  /** Shown beside each stretch of visits that no aside covers. */
  gap?: (visits: Visit[]) => ReactNode;
  /** Whether the asides are shown; hidden, their column closes and the visits take the width. */
  asidesVisible?: boolean;
};

const VisitList = ({ groups, asides, gap, asidesVisible = true }: Props) => {
  // One grid row per heading and per visit, so an aside can span the rows it covers.
  const rows = new Map<Visit, number>();
  let row = 0;
  for (const { visits } of groups) {
    row++;
    for (const visit of visits) rows.set(visit, ++row);
  }

  const placed = asides ? place(asides, rows) : [];
  const runs = asides && gap ? gaps(rows, placed) : [];
  // Both layouts have two tracks, so the width can animate between them.
  const style: CSSProperties = asides
    ? {
        gridTemplateColumns: `minmax(0, 1fr) ${asidesVisible ? "17rem" : "0rem"}`,
        columnGap: asidesVisible ? "1rem" : "0rem",
      }
    : { gridTemplateColumns: "minmax(0, 1fr)" };

  row = 0;
  return (
    <div
      className="grid transition-[grid-template-columns,column-gap] duration-150 ease-out motion-reduce:transition-none"
      style={style}
    >
      {groups.map(({ key, label, visits, anchor }, index) => (
        <Fragment key={key}>
          <h3
            id={anchor}
            style={rowStyle(++row)}
            className={`scroll-mt-32 px-3 pb-1 text-xs font-medium text-muted ${index > 0 ? "mt-4" : ""}`}
          >
            {label}
          </h3>

          {visits.map((visit) => (
            <a
              key={visit.id}
              href={visit.url}
              data-visit-time={visit.time}
              style={rowStyle(++row)}
              className={`flex items-center gap-3 rounded-lg px-3 py-1.5 outline-none fade hover:bg-control focus-visible:ring-2 focus-visible:ring-purple`}
            >
              <Favicon url={visit.url} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-fg">{visit.title}</span>
                <span className="truncate text-xs text-faint">
                  {readable(visit.url)}
                </span>
              </span>
              <time className="shrink-0 text-xs text-purple tabular-nums">
                {format(visit.time, "HH:mm:ss")}
              </time>
            </a>
          ))}
        </Fragment>
      ))}

      {placed.map(({ aside, first, last }) => (
        <div
          key={aside.key}
          style={{ gridColumn: 2, gridRow: `${first} / ${last + 1}` }}
          className={cn("py-0.5", asideMotion(asidesVisible))}
          inert={!asidesVisible}
        >
          <div className="h-full w-68">{aside.content}</div>
        </div>
      ))}

      {runs.map(({ first, last, visits }) => (
        <div
          key={`gap-${first}`}
          style={{ gridColumn: 2, gridRow: `${first} / ${last + 1}` }}
          className={cn("py-0.5", asideMotion(asidesVisible))}
          inert={!asidesVisible}
        >
          <div className="h-full w-68">{gap?.(visits)}</div>
        </div>
      ))}
    </div>
  );
};

export default VisitList;
