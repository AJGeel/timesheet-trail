import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";

import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import {
  normalizeSite,
  type SuggestionSettings,
} from "@/src/services/suggestions/suggestSlots";

const slotOptions = [5, 10, 15, 30, 60];

type SlotProps = {
  slotMinutes: number;
  onChange: (slotMinutes: number) => void;
};

/** The length of a timesheet slot. */
export const SlotSelect = ({ slotMinutes, onChange }: SlotProps) => (
  <label className="flex items-center gap-2 text-muted">
    Slot
    <select
      value={slotMinutes}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-7 rounded-lg bg-hover px-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-blue"
    >
      {slotOptions.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes} min
        </option>
      ))}
    </select>
  </label>
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
      <div className="flex flex-wrap gap-1.5">
        {sites.length === 0 && (
          <span className="text-faint">
            No sites: no tickets will be found.
          </span>
        )}
        {sites.map((entry) => (
          <span
            key={entry}
            className="inline-flex h-6 items-center gap-1 rounded-md bg-hover pr-1 pl-2 text-fg"
          >
            {entry}
            <button
              type="button"
              aria-label={`Remove ${entry}`}
              className="flex size-4 items-center justify-center rounded text-muted outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-blue"
              onClick={() => onChange(sites.filter((s) => s !== entry))}
            >
              <XIcon size={10} weight="bold" />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={add} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="jira.yourcompany.com"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-9"
          disabled={!site}
          icon={<PlusIcon size={14} weight="bold" />}
        >
          Add
        </Button>
      </form>
    </div>
  );
};

type FieldsProps = {
  settings: SuggestionSettings;
  onChange: (change: Partial<SuggestionSettings>) => void;
};

/** All the suggestions' settings, as the modal lists them. */
const SettingsFields = ({ settings, onChange }: FieldsProps) => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-fg">Time slots</span>
        <span className="text-xs text-muted">
          Suggested time is rounded to whole slots.
        </span>
      </div>
      <div>
        <SlotSelect
          slotMinutes={settings.slotMinutes}
          onChange={(slotMinutes) => onChange({ slotMinutes })}
        />
      </div>
    </div>

    <hr className="border-t border-hover" />

    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-fg">Ticket sites</span>
        <span className="text-xs text-muted">
          Tickets are looked for on these sites, such as Jira, GitLab or
          Confluence, and on their subdomains.
        </span>
      </div>
      <TicketSites
        sites={settings.ticketSites}
        onChange={(ticketSites) => onChange({ ticketSites })}
      />
    </div>
  </div>
);

export default SettingsFields;
