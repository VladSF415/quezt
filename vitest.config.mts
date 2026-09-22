import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": tsconfigPaths.resolve(__dirname, "."),
    },
  },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
