import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";

import { cn } from "@/src/utils";

type Props = ComponentProps<typeof BaseButton> & { label: string };

const IconButton = ({ label, className, ...props }: Props) => (
  <BaseButton
    aria-label={label}
    title={label}
    {...props}
    className={cn(
      "flex size-8 shrink-0 items-center justify-center rounded-lg bg-control text-muted outline-none press hover:bg-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-purple disabled:pointer-events-none disabled:bg-transparent disabled:opacity-30",
      className,
    )}
  />
);

export default IconButton;
