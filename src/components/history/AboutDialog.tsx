import { Dialog } from "@base-ui/react/dialog";
import {
  GlobeIcon,
  PencilSimpleLineIcon,
  QuestionIcon,
  SlidersHorizontalIcon,
  TicketIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import Banner from "@/src/components/ui/Banner";
import IconButton from "@/src/components/ui/IconButton";

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
  {
    icon: <PencilSimpleLineIcon size={20} weight="duotone" />,
    title: "Fill in your hours",
    text: "Bummer. Not yet automated. Oh well!",
  },
];

/** A floating help button that opens what the extension is for, in a few lines. */
const AboutDialog = () => (
  <Dialog.Root>
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
      <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm" />
      <Dialog.Popup className="fixed top-1/2 left-1/2 z-30 flex max-h-[90vh] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-canvas text-[13px] shadow-xl outline-none">
        <Banner
          title={<Dialog.Title>Timesheet Trail</Dialog.Title>}
          description={
            <Dialog.Description>
              Your browsing, turned into hours.
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
          <p className="text-[14px] leading-relaxed text-fg">
            Nobody likes filling out timesheets. Review the pages you browsed
            and get suggestions on how to track your hours.
          </p>

          <ol className="grid grid-cols-3 gap-2">
            {steps.map(({ icon, title, text }, index) => (
              <li
                key={title}
                className="flex flex-col gap-2 rounded-xl bg-control p-3"
              >
                <span className="flex items-center justify-between text-purple">
                  {icon}
                  <span className="text-xs font-semibold text-faint">
                    {index + 1}
                  </span>
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold text-fg">{title}</span>
                  <span className="text-xs text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-3 rounded-xl border border-dashed border-hover px-4 py-3 text-faint">
            <SlidersHorizontalIcon size={18} />
            Settings will live here.
          </div>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
);

export default AboutDialog;
