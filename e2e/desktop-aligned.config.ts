import { defineConfig } from "@playwright/test";
/** Measures Desktop aligned in headless Chromium: whole squares across, the height's leftover on top. */
export default defineConfig({ testDir: "./tests", testMatch: "desktop-aligned.spec.ts", workers: 1,
  use: { baseURL: "http://127.0.0.1:5191", headless: true, viewport: { width: 1440, height: 900 } },
  webServer: { command: "node e2e/grid-geometry-server.mjs", cwd: "..", url: "http://127.0.0.1:5191/e2e/fixtures/desktop-aligned.html", reuseExistingServer: true }
});
