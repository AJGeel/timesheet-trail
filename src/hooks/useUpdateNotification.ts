import { useCallback, useEffect, useState } from "react";
import { storage } from "webextension-polyfill";

const updatedKey = "newUpdate";
const enabledKey = "updateNoticesEnabled";

/**
 * Whether the extension was updated since the notice was last dismissed, and
 * whether the user wants such notices at all, kept in `storage.local`.
 */
export const useUpdateNotification = () => {
  const [updated, setUpdated] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    storage.local.get([updatedKey, enabledKey]).then((items) => {
      setUpdated(items[updatedKey] === true);
      setEnabled(items[enabledKey] !== false);
    });
  }, []);

  const dismiss = useCallback(() => {
    setUpdated(false);
    storage.local.set({ [updatedKey]: false });
  }, []);

  // Turning notices off keeps a pending update, so turning them on again shows it.
  const changeEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    storage.local.set({ [enabledKey]: next });
  }, []);

  return { visible: updated && enabled, dismiss, enabled, changeEnabled };
};
