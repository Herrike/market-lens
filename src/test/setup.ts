import "@testing-library/jest-dom";
import { mockAnimationsApi } from "jsdom-testing-mocks";

// Mock animations API to silence Headless UI warnings
mockAnimationsApi();

// Mock environment variables for tests
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_FMP_BASE_URL: "https://financialmodelingprep.com/api/v3",
    VITE_FMP_API_KEY: "test-api-key",
    MODE: "test",
    DEV: false,
    PROD: false,
    SSR: false,
  },
  writable: true,
});
