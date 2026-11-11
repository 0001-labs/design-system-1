import { defineConfig } from "@playwright/test";
/**
 * Each component's own tokens in headless Chromium (unset, every face renders as it did before
 * they existed; set, each changes only its own property), the base editor that sets them, and the
 * same canvas in a library's workbench.
 * Shares the repository-root Vite server of the grid geometry suite.
 */
export default defineConfig({ testDir: "./tests", testMatch: /(component-(tokens|editor)|library-canvas)\.spec\.ts/, workers: 1,
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}{ext}",
  use: { baseURL: "http://127.0.0.1:5191", viewport: { width: 1280, height: 900 } },
  webServer: { command: "node e2e/grid-geometry-server.mjs", cwd: "..", url: "http://127.0.0.1:5191/e2e/fixtures/component-tokens.html", reuseExistingServer: true }
});
