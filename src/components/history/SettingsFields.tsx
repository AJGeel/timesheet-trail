import { Input as BaseInput } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
import { Switch } from "@base-ui/react/switch";
import { CaretDownIcon, CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";

import Button from "@/src/components/ui/Button";
import { cn } from "@/src/utils";
import {
  normalizeSite,
  type SuggestionSettings,
} from "@/src/services/suggestions/suggestSlots";

const slotOptions = [5, 10, 15, 30, 60];

type SlotProps = {
  slotMinutes: number;
  onChange: (slotMinutes: number) => void;
  /** Shows the "Slot" label; without it, the surroundings must say what this is. */
  labelled?: boolean;
  /** Added to the select, e.g. to match what it sits on. */
  className?: string;
};

const slotItems = slotOptions.map((minutes) => ({
  value: minutes,
  label: `${minutes} min`,
}));

/** The length of a timesheet slot. */
export const SlotSelect = ({
  slotMinutes,
  onChange,
  labelled = true,
  className,
}: SlotProps) => (
  <Select.Root
    items={slotItems}
    value={slotMinutes}
    onValueChange={(value) => value !== null && onChange(value)}
  >
    <div className="flex items-center gap-2 text-muted">
      {labelled ? (
        <Select.Label>Slot</Select.Label>
      ) : (
        <Select.Label className="sr-only">Slot</Select.Label>
      )}
      <Select.Trigger
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-lg bg-hover pr-1.5 pl-2.5 text-fg outline-none transition-colors hover:brightness-95 focus-visible:ring-2 focus-visible:ring-purple data-popup-open:ring-2 data-popup-open:ring-purple dark:hover:brightness-125",
          className,
        )}
      >
        <Select.Value />
        <Select.Icon className="text-muted">
          <CaretDownIcon size={12} weight="bold" />
        </Select.Icon>
      </Select.Trigger>
    </div>

    <Select.Portal>
      <Select.Positioner
        alignItemWithTrigger={false}
        side="bottom"
        align="end"
        sideOffset={6}
        className="z-50"
      >
        <Select.Popup className="min-w-24 origin-(--transform-origin) rounded-xl bg-canvas p-1 shadow-lg ring-1 ring-black/10 outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none dark:ring-white/10">
          {slotItems.map(({ value, label }) => (
            <Select.Item
              key={value}
              value={value}
              className="flex h-8 cursor-default items-center justify-between gap-4 rounded-lg px-2.5 text-fg outline-none select-none data-highlighted:bg-control"
            >
              <Select.ItemText>{label}</Select.ItemText>
              <Select.ItemIndicator className="text-purple">
                <CheckIcon size={12} weight="bold" />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

type SitesProps = {
  sites: string[];
  onChange: (sites: string[]) => void;
};

/** The sites that hold ticket content, to add to and remove from. */
export const TicketSites = ({ sites, onChange }: SitesProps) => {
  const [text, setText] = useState("");
  const site = normalizeSite(text);

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!site) return;

    if (!sites.includes(site)) onChange([...sites, site]);
    setText("");
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={add}
        className="flex flex-wrap items-center gap-1.5 rounded-lg bg-control p-2.5 transition-colors focus-within:bg-hover focus-within:ring-2 focus-within:ring-purple"
      >
        {sites.map((entry) => (
          <span
            key={entry}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-canvas pr-1.5 pl-2.5 text-fg"
          >
            {entry}
            <button
              type="button"
              aria-label={`Remove ${entry}`}
              className="flex size-4 items-center justify-center rounded text-muted outline-none press hover:text-fg focus-visible:ring-2 focus-visible:ring-purple"
              onClick={() => onChange(sites.filter((s) => s !== entry))}
            >
              <XIcon size={10} weight="bold" />
            </button>
          </span>
        ))}

        <BaseInput
          aria-label="Add a ticket site"
          placeholder="jira.yourcompany.com"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="h-7 min-w-36 flex-1 bg-transparent px-1.5 text-fg outline-none"
        />

        <Button
          type="submit"
          variant="ghost"
          className="h-7 px-2"
          disabled={!site}
          icon={<PlusIcon size={12} weight="bold" />}
        >
          Add
        </Button>
      </form>

      <span className="text-xs text-muted">
        {sites.length === 0
          ? "No sites: no tickets will be found."
          : "Tickets are detected from these sites."}
      </span>
    </div>
  );
};

type FieldsProps = {
  settings: SuggestionSettings;
  onChange: (change: Partial<SuggestionSettings>) => void;
  updateNotices: boolean;
  onUpdateNotices: (enabled: boolean) => void;
  onShowUpdates: () => void;
};

/** All the suggestions' settings, as the modal lists them. */
const SettingsFields = ({
  settings,
  onChange,
  updateNotices,
  onUpdateNotices,
  onShowUpdates,
}: FieldsProps) => (
  <div className="flex flex-col gap-5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-fg">Time slots</span>
        <span className="text-xs text-muted">
          Suggested time is rounded to whole slots.
        </span>
      </div>
      <SlotSelect
        labelled={false}
        className="bg-control"
        slotMinutes={settings.slotMinutes}
        onChange={(slotMinutes) => onChange({ slotMinutes })}
      />
    </div>

    <hr className="border-t border-hover" />

    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-bold text-fg">Ticket sites</span>
      <TicketSites
        sites={settings.ticketSites}
        onChange={(ticketSites) => onChange({ ticketSites })}
      />
    </div>

    <hr className="border-t border-hover" />

    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-fg">Update notices</span>
        <span className="text-xs text-muted">
          Show a bell when there is news in a new version.
        </span>
        <button
          type="button"
          onClick={onShowUpdates}
          className="mt-1 w-fit text-xs font-medium text-purple underline outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-purple"
        >
          View the current updates
        </button>
      </div>
      {/* The thumb springs across, leans in on hover and stretches while pressed, staying on its own side. */}
      <Switch.Root
        aria-label="Update notices"
        checked={updateNotices}
        onCheckedChange={onUpdateNotices}
        className="group flex h-6 w-11 shrink-0 items-center rounded-full bg-hover px-0.5 outline-none press hover:ring-4 hover:ring-hover/60 focus-visible:ring-2 focus-visible:ring-purple data-checked:bg-brand data-checked:hover:ring-brand/20"
      >
        <Switch.Thumb className="group/thumb flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-[translate,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:w-[22px] group-active:w-6 data-checked:translate-x-5 data-checked:group-hover:translate-x-[18px] data-checked:group-active:translate-x-4 motion-reduce:transition-none">
          <CheckIcon
            size={11}
            weight="bold"
            className="scale-50 text-brand opacity-0 transition-[scale,opacity] duration-200 ease-out group-data-checked/thumb:scale-100 group-data-checked/thumb:opacity-100 motion-reduce:transition-none"
          />
        </Switch.Thumb>
      </Switch.Root>
    </div>
  </div>
);

export default SettingsFields;
