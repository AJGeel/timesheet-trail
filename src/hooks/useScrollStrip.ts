import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Width of the fade that hints at more items beyond an edge. */
const fade = 28;

/** Fades out the edges that have more to scroll to; none when it all fits. */
const mask = (start: boolean, end: boolean): CSSProperties | undefined => {
  if (!start && !end) return undefined;

  const image = `linear-gradient(to right, ${start ? "transparent" : "black"}, black ${start ? fade : 0}px, black calc(100% - ${end ? fade : 0}px), ${end ? "transparent" : "black"})`;
  return { maskImage: image, WebkitMaskImage: image };
};

/**
 * For a horizontally scrolling row of items: fades the edges that have more to
 * scroll to, and keeps the active item in view. Put `ref` and `style` on the
 * scroller, whose children are the items.
 *
 * @param active Index of the active item, or `null` for none.
 */
export const useScrollStrip = (active: number | null) => {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  // Tracks whether there is more to scroll to on either side.
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const update = () => {
      const start = container.scrollLeft > 1;
      const end =
        container.scrollLeft + container.clientWidth <
        container.scrollWidth - 1;
      setOverflow((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      container.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // Scrolls the strip itself, since `scrollIntoView` would move the page as well.
  useEffect(() => {
    const container = ref.current;
    const target = active === null ? null : container?.children[active];
    if (!container || !(target instanceof HTMLElement)) return;

    const left = target.offsetLeft;
    const right = left + target.offsetWidth;
    if (left < container.scrollLeft) {
      container.scrollTo({ left: left - 4, behavior: "smooth" });
    } else if (right > container.scrollLeft + container.clientWidth) {
      container.scrollTo({
        left: right - container.clientWidth + 4,
        behavior: "smooth",
      });
    }
  }, [active]);

  return { ref, style: mask(overflow.start, overflow.end) };
};

/** The scroller's layout; the padding and negative margin leave room for the focus rings the scroll would clip. */
export const scrollStripClass =
  "relative -m-0.5 flex items-center gap-1 overflow-x-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
