import { Dialog } from "@base-ui/react/dialog";
import { BellSlashIcon, XIcon } from "@phosphor-icons/react";
import { format, isValid, parseISO } from "date-fns";
import { createContext, type PropsWithChildren, use } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { runtime } from "webextension-polyfill";

import changelog from "../../../CHANGELOG.md?raw";
import Banner from "@/src/components/ui/Banner";
import Button from "@/src/components/ui/Button";
import IconButton from "@/src/components/ui/IconButton";
import Kbd from "@/src/components/ui/Kbd";
import { parseReleaseNotes } from "@/src/services/changelog/parseChangelog";
import { remarkKbd } from "@/src/services/changelog/remarkKbd";
import { cn } from "@/src/utils";

/** How many lists this one is inside of, so nested bullets can be set apart. */
const ListDepthContext = createContext(0);

const List = ({ children }: PropsWithChildren) => {
  const depth = use(ListDepthContext);

  return (
    <ListDepthContext value={depth + 1}>
      <ul
        className={cn(
          "pl-5 marker:text-purple",
          // Sub-points hug their parent and each other, with hollow bullets.
          depth === 0
            ? "list-disc space-y-3"
            : "mt-2 list-[circle] space-y-1.5",
        )}
      >
        {children}
      </ul>
    </ListDepthContext>
  );
};

const components: Components = {
  h3: ({ children }) => (
    <h3 className="mt-7 mb-3 text-lg font-bold tracking-tight text-fg first:mt-0">
      {children}
    </h3>
  ),
  ul: List,
  li: ({ children }) => (
    <li className="pl-1 text-sm leading-normal text-fg">{children}</li>
  ),
  kbd: ({ children }) => <Kbd>{children}</Kbd>,
  code: ({ children }) => (
    <code className="rounded bg-control px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-purple underline hover:no-underline"
    >
      {children}
    </a>
  ),
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the update notification is still showing, and so can be dismissed here. */
  notified: boolean;
  onDismiss: () => void;
  /** Whether update notices are on; the hint to turn them off only shows then. */
  updateNotices: boolean;
  onOpenSettings: () => void;
};

/** This version's part of CHANGELOG.md, bundled into the build. Loaded on demand, with react-markdown. */
const WhatsNewDialog = ({
  open,
  onOpenChange,
  notified,
  onDismiss,
  updateNotices,
  onOpenSettings,
}: Props) => {
  const { version } = runtime.getManifest();
  const notes = parseReleaseNotes(changelog, version);
  const date = notes?.date ? parseISO(notes.date) : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-30 flex max-h-[90vh] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-canvas text-[13px] shadow-xl outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
          <Banner
            title={<Dialog.Title>What&apos;s new in {version}</Dialog.Title>}
            description={
              <Dialog.Description>
                {date && isValid(date)
                  ? `Released ${format(date, "d MMMM yyyy")}`
                  : "Timesheet Trail has been updated."}
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

          <div className="overflow-y-auto p-6">
            {notes ? (
              <ReactMarkdown
                remarkPlugins={[remarkKbd]}
                components={components}
              >
                {notes.body}
              </ReactMarkdown>
            ) : (
              <p className="text-muted">There are no notes for this version.</p>
            )}

            {updateNotices && (
              <p className="mt-6 text-xs text-muted">
                Don&apos;t like seeing these messages? Turn them off{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenSettings();
                  }}
                  className="font-medium text-purple underline outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-purple"
                >
                  here
                </button>
                .
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 bg-hover/30 px-6 py-4">
            {notified && (
              <Button
                variant="ghost"
                icon={<BellSlashIcon size={16} weight="bold" />}
                onClick={() => {
                  onDismiss();
                  onOpenChange(false);
                }}
              >
                Dismiss notification
              </Button>
            )}
            <Dialog.Close render={<Button variant="secondary" />}>
              Close
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WhatsNewDialog;
