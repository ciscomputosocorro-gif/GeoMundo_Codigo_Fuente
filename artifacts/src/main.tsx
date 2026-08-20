import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress WebGL context creation errors from bubbling to the Vite error overlay.
// These are expected in headless/low-GPU environments; FiguraViewer3D and VR pages
// handle the failure gracefully with their own fallbacks.
window.addEventListener(
  "error",
  (e) => {
    if (
      e.message?.includes("WebGL context") ||
      e.message?.includes("WebGL") ||
      e.error?.message?.includes("WebGL context")
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true,
);

createRoot(document.getElementById("root")!).render(<App />);
