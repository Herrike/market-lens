/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NODE_ENV === "production" ? "/market-lens/" : "/",

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@headlessui/react"],
    exclude: ["highcharts", "highcharts-react-official"], // Keep charts lazy
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and React DOM - critical, should be separate
          if (id.includes("react") || id.includes("react-dom")) {
            return "react";
          }

          // Highcharts - heavy library, separate chunk
          if (id.includes("highcharts")) {
            return "charts";
          }

          // UI components - moderate size
          if (id.includes("@headlessui") || id.includes("@heroicons")) {
            return "ui";
          }

          // Node modules - vendor chunk
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // App code chunks by feature
          if (id.includes("src/components/search-modal")) {
            return "search";
          }

          if (
            id.includes("src/components/stock-chart") ||
            id.includes("src/components/chart")
          ) {
            return "chart-feature";
          }

          if (id.includes("src/services") || id.includes("src/hooks")) {
            return "services";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
