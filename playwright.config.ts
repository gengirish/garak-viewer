import { defineConfig, devices } from "@playwright/test";
import path from "path";

const fixturesDir = path.join(__dirname, "e2e", "fixtures", "garak_runs");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next dev --port 3000`,
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      GARAK_RUNS_DIR: fixturesDir,
    },
  },
});
