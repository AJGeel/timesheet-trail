import { format } from "date-fns";

import Favicon from "@/src/components/ui/Favicon";
import type { Visit } from "@/src/services/history/types";

export type VisitGroup = {
  key: string;
  label: string;
  visits: Visit[];
  /** Element id, so the group can be scrolled to. */
  anchor?: string;
};

/** The URL without its scheme and `www.`, as it reads best in a list. */
const readable = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

const VisitList = ({ groups }: { groups: VisitGroup[] }) => (
  <div className="flex flex-col gap-5">
    {groups.map(({ key, label, visits, anchor }) => (
      <section key={key} id={anchor} className="scroll-mt-32">
        <h3 className="px-3 pb-1 text-xs font-medium text-muted">{label}</h3>

        <div>
          {visits.map((visit) => (
            <a
              key={visit.id}
              href={visit.url}
              className="flex items-center gap-3 rounded-lg px-3 py-1.5 outline-none hover:bg-control focus-visible:ring-2 focus-visible:ring-blue"
            >
              <Favicon url={visit.url} />
              <span className="min-w-0 flex-1 truncate">
                <span className="text-fg">{visit.title}</span>
                <span className="ml-2 text-faint">{readable(visit.url)}</span>
              </span>
              <time className="shrink-0 font-mono text-xs text-amber tabular-nums">
                {format(visit.time, "HH:mm:ss")}
              </time>
            </a>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default VisitList;
