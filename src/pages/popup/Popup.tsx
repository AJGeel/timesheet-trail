import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";

import Button from "@/src/components/ui/Button";
import { openHistory } from "@/src/services/history/openHistory";

export default function Popup() {
  return (
    <div className="flex w-60 flex-col gap-3 p-4">
      <h1 className="text-sm font-semibold text-fg">Timesheet Trail</h1>
      <Button
        icon={<ClockCounterClockwiseIcon size={16} weight="bold" />}
        onClick={() => {
          void openHistory().then(() => window.close());
        }}
      >
        Open history
      </Button>
    </div>
  );
}
