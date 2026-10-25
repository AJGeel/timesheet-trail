import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";

import Banner from "@/src/components/ui/Banner";
import Button from "@/src/components/ui/Button";
import { openHistory } from "@/src/services/history/openHistory";

export default function Popup() {
  return (
    <div className="flex w-80 flex-col">
      <Banner
        title="Timesheet Trail"
        description="Your browsing, turned into hours."
      />

      <div className="flex flex-col gap-4 p-4">
        <p className="leading-relaxed text-muted">
          Your history, laid out by day, with the tickets you worked on
          suggested for your timesheet.
        </p>

        <Button
          icon={<ClockCounterClockwiseIcon size={16} weight="bold" />}
          onClick={() => {
            void openHistory().then(() => window.close());
          }}
        >
          Open history
        </Button>
      </div>
    </div>
  );
}
