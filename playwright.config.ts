import { defineConfig, devices } from "@playwright/test";

// Point at a running server with E2E_BASE_URL (handy when `next dev` is
// already up). Otherwise Playwright boots its own dev server on port 3117.
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3117",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          command: "npm run dev -- --port 3117",
          url: "http://localhost:3117",
          reuseExistingServer: !process.env.CI,
          env: {
            NEXT_PUBLIC_I18N_PREFIX_LOCALE: "false",
          },
        },
      }),
});
