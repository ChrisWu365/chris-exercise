import { defineConfig, devices } from "@playwright/test";

// SMOKE_URL points the same tests at the deployed site, with no local server.
const smokeUrl = process.env.SMOKE_URL;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: smokeUrl ?? "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: smokeUrl
    ? undefined
    : { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: false },
});
