import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type Props = {
  content: ReactNode;
  /** The element the tooltip describes; it becomes the trigger, so no wrapper is added. */
  children: ReactElement<Record<string, unknown>>;
  /** Keeps the tooltip from showing, without the trigger remounting as it would if unwrapped. */
  disabled?: boolean;
  side?: ComponentProps<typeof BaseTooltip.Positioner>["side"];
};

/** A tooltip with a tip pointing at its trigger. */
const Tooltip = ({ content, children, disabled, side = "top" }: Props) => (
  <BaseTooltip.Provider delay={200}>
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={10} className="z-50">
          <BaseTooltip.Popup className="max-w-60 rounded-lg bg-fg px-2.5 py-1.5 text-center text-xs font-medium text-canvas shadow-lg transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            {/* Drawn pointing up, then turned to face the trigger from whichever side it sits on. */}
            <BaseTooltip.Arrow className="data-[side=bottom]:-top-2 data-[side=left]:-right-[13px] data-[side=left]:rotate-90 data-[side=right]:-left-[13px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180">
              <svg
                aria-hidden
                width="20"
                height="10"
                viewBox="0 0 20 10"
                className="fill-fg"
              >
                <path d="M9.66 .8 Q10 .5 10.34 .8 L18 8 Q19 10 17 10 H3 Q1 10 2 8 Z" />
              </svg>
            </BaseTooltip.Arrow>
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  </BaseTooltip.Provider>
);

export default Tooltip;
