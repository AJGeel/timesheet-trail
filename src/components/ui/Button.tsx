import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/src/utils";

const variants = {
  primary: "bg-brand text-white hover:brightness-110 active:brightness-95",
  secondary: "bg-control text-fg hover:bg-hover",
  ghost: "text-muted hover:bg-hover hover:text-fg",
} as const;

type Props = ComponentProps<typeof BaseButton> & {
  variant?: keyof typeof variants;
  icon?: ReactNode;
};

const Button = ({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: Props) => (
  <BaseButton
    {...props}
    className={cn(
      "inline-flex h-8 items-center justify-center gap-2 rounded-lg px-3 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue disabled:opacity-50",
      variants[variant],
      className,
    )}
  >
    {icon}
    {children}
  </BaseButton>
);

export default Button;
