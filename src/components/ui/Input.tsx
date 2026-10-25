import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/src/utils";

type Props = ComponentProps<typeof BaseInput> & {
  /** Rendered inside the field, before the text. */
  icon?: ReactNode;
  /** Rendered inside the field, after the text. */
  trailing?: ReactNode;
};

const Input = ({ icon, trailing, className, ...props }: Props) => (
  <label className="group flex h-9 items-center gap-2 rounded-lg bg-control px-3 transition-colors focus-within:bg-hover focus-within:ring-2 focus-within:ring-purple">
    <span className="text-faint group-focus-within:text-purple">{icon}</span>
    <BaseInput
      {...props}
      className={cn(
        "min-w-0 flex-1 bg-transparent text-fg outline-none",
        className,
      )}
    />
    {trailing}
  </label>
);

export default Input;
