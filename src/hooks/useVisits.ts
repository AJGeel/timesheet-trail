import { useEffect, useState } from "react";

import { searchVisits } from "@/src/services/history/searchVisits";
import type { Visit, VisitQuery } from "@/src/services/history/types";

/** The visits matching the query; `loading` until the first result for it arrives. */
export const useVisits = ({ text, start, end }: VisitQuery) => {
  const [result, setResult] = useState<{ key: string; visits: Visit[] }>();
  const key = `${text}|${start}|${end}`;

  useEffect(() => {
    let stale = false;

    searchVisits({ text, start, end }).then((visits) => {
      if (!stale) setResult({ key, visits });
    });

    return () => {
      stale = true;
    };
  }, [key, text, start, end]);

  return {
    visits: result?.visits ?? [],
    loading: result?.key !== key,
  };
};
