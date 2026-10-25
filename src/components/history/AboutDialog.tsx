import { Dialog } from "@base-ui/react/dialog";
import {
  GlobeIcon,
  PencilSimpleLineIcon,
  QuestionIcon,
  SlidersHorizontalIcon,
  TicketIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, type ReactNode } from "react";

import SettingsFields from "@/src/components/history/SettingsFields";
import Banner from "@/src/components/ui/Banner";
import ShortcutHint from "@/src/components/ui/ShortcutHint";
import IconButton from "@/src/components/ui/IconButton";
import type { SuggestionSettings } from "@/src/services/suggestions/suggestSlots";

const steps: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <GlobeIcon size={20} weight="duotone" />,
    title: "Browse as usual",
    text: "E.g.: Jira, GitLab, GitHub, Confluence.",
  },
  {
    icon: <TicketIcon size={20} weight="duotone" />,
    title: "See your day",
    text: "Time slots, matched to tickets.",
  },
];

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
      <Dialog.Trigger
        render={
          <IconButton
            label="About Timesheet Trail"
            className="fixed right-6 bottom-6 z-10 size-10 rounded-full shadow-md"
          />
        }
      >
        <QuestionIcon size={20} weight="bold" />
      </Dialog.Trigger>

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
            footer={
              <ol className="grid grid-cols-2 gap-2">
                {steps.map(({ icon, title, text }) => (
                  <li
                    key={title}
                    className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-fg ring-1 ring-white/20"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      {icon}
                    </span>
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="font-semibold">{title}</span>
                      <span className="text-xs text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
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
