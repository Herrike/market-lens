import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Preload critical chunks for better LCP
const preloadChunks = () => {
  // Preload the search modal since it's commonly used
  import("./components/search-modal/SearchModal");
  // Preload services for faster data fetching
  import("./services/api");
};

// Preload after initial render
setTimeout(preloadChunks, 100);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
