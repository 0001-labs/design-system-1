import { defineConfig } from "@playwright/test";
/** Plays the Multitrack workbench in headless Chromium, Desktop aligned, on the documentation's own pages. */
export default defineConfig({ testDir: "./tests", testMatch: "workbench-multitrack.spec.ts", workers: 1, outputDir: "./test-results",
  use: { baseURL: "http://127.0.0.1:4329", headless: true, viewport: { width: 1440, height: 900 } },
  webServer: { command: "vp exec astro dev --host 127.0.0.1 --port 4329", cwd: "../website", url: "http://127.0.0.1:4329/examples/layouts/workbench-multitrack/", reuseExistingServer: true, timeout: 180_000 }
});
