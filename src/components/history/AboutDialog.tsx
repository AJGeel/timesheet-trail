import { Dialog } from "@base-ui/react/dialog";
import { SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

import SettingsFields from "@/src/components/history/SettingsFields";
import Banner from "@/src/components/ui/Banner";
import ShortcutHint from "@/src/components/ui/ShortcutHint";
import IconButton from "@/src/components/ui/IconButton";
import Tooltip from "@/src/components/ui/Tooltip";
import type { SuggestionSettings } from "@/src/services/suggestions/suggestSlots";

/** What the help buttons say on hover. */
export const aboutHint =
  "What is Timesheet Trail? Learn how it works and change settings";

type Props = {
  open: boolean;
  /** Scrolls to the settings when opened. */
  section?: "settings";
  onOpenChange: (open: boolean) => void;
  settings: SuggestionSettings;
  onSettings: (change: Partial<SuggestionSettings>) => void;
};

/** A floating help button that opens what the extension is for, in a few lines, and its settings. */
const AboutDialog = ({
  open,
  section,
  onOpenChange,
  settings,
  onSettings,
}: Props) => {
  const settingsRef = useRef<HTMLDivElement>(null);

  // The dialog mounts after `open` changes, so wait a frame before scrolling.
  useEffect(() => {
    if (!open || section !== "settings") return;

    const frame = requestAnimationFrame(() =>
      settingsRef.current?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, section]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Tooltip side="left" content={aboutHint}>
        <Dialog.Trigger
          render={
            <IconButton
              label="About Timesheet Trail"
              title={undefined}
              className="fixed right-6 bottom-6 z-10 size-12 rounded-full bg-canvas shadow-lg ring-1 ring-black/5 hover:bg-control"
            >
              <img src="/icon-128.png" alt="" className="size-7" />
            </IconButton>
          }
        />
      </Tooltip>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-30 flex max-h-[90vh] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-canvas text-[13px] shadow-xl outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
          <Banner
            title={<Dialog.Title>Timesheet Trail</Dialog.Title>}
            description={
              <Dialog.Description>
                Review the pages you browsed and get suggestions on how to track
                your hours.
              </Dialog.Description>
            }
          >
            <Dialog.Close
              render={
                <IconButton
                  label="Close"
                  className="absolute top-3 right-3 size-7 bg-white/15 text-white hover:bg-white/25 hover:text-white"
                />
              }
            >
              <XIcon size={14} weight="bold" />
            </Dialog.Close>
          </Banner>

          <div className="flex flex-col gap-5 overflow-y-auto p-6">
            <div ref={settingsRef} className="flex scroll-mt-6 flex-col gap-5">
              <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-fg">
                <SlidersHorizontalIcon size={18} weight="bold" />
                Settings
              </h3>
              <SettingsFields settings={settings} onChange={onSettings} />
            </div>
            <div className="-m-6 mt-6 bg-hover/30 p-6">
              <ShortcutHint />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AboutDialog;
