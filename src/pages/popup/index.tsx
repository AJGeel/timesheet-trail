import { createRoot } from "react-dom/client";

import Popup from "@/src/pages/popup/Popup";

const rootContainer = document.querySelector("#__root");

if (!rootContainer) {
  throw new Error("Can't find Popup root element");
}

createRoot(rootContainer).render(<Popup />);
