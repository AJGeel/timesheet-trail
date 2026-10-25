import { createRoot } from "react-dom/client";

import "@/src/assets/styles/tailwind.css";
import History from "@/src/pages/history/History";

const rootContainer = document.querySelector("#__root");

if (!rootContainer) {
  throw new Error("Can't find History root element");
}

createRoot(rootContainer).render(<History />);
