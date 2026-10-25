import type { ComponentProps } from "react";

import { cn } from "@/src/utils";

/** A softly filled surface, set apart by its background alone. */
const Panel = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cn("rounded-xl bg-control", className)} />
);

export default Panel;
