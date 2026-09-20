import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the @/components and @/lib mappings in tsconfig.json.
    alias: [
      {
        find: /^@\/components\//,
        replacement: `${import.meta.dirname}/shared/components/`,
      },
      {
        find: /^@\/lib\//,
        replacement: `${import.meta.dirname}/shared/lib/`,
      },
      { find: "@", replacement: import.meta.dirname },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./shared/test-setup.ts"],
    include: ["shared/**/*.test.{ts,tsx}", "*.test.ts"],
  },
});
