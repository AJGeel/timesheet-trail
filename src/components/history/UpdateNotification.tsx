import { BellRingingIcon, XIcon } from "@phosphor-icons/react";

import Tooltip from "@/src/components/ui/Tooltip";

type Props = {
  onOpen: () => void;
  onDismiss: () => void;
};

/** A round bell above the help button, telling there is news. Dismissing it is revealed on hover. */
const UpdateNotification = ({ onOpen, onDismiss }: Props) => (
  <div className="group fixed right-6 bottom-22 z-10 animate-[fade-in_300ms_ease-out_both] motion-reduce:animate-none">
    <Tooltip side="left" content="What's new in this version">
      <button
        type="button"
        onClick={onOpen}
        className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg outline-none press hover:brightness-110 focus-visible:ring-2 focus-visible:ring-purple"
      >
        <BellRingingIcon size={24} weight="fill" />
        <span className="sr-only">What&apos;s new in this version</span>
      </button>
    </Tooltip>

    <button
      type="button"
      aria-label="Dismiss"
      title="Dismiss"
      onClick={onDismiss}
      className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-canvas text-muted opacity-0 shadow-md ring-1 ring-black/10 outline-none transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-fg focus-visible:ring-2 focus-visible:ring-purple"
    >
      <XIcon size={10} weight="bold" />
    </button>
  </div>
);

export default UpdateNotification;
