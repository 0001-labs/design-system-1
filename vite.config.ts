import { defineConfig } from "vite-plus";

export default defineConfig({
  check: {
    fmt: false,
  },
  fmt: {
    ignorePatterns: [
      ".wrangler/**",
      "app/**",
      "convex/signIn/**",
      "dist/**",
      "move out/**",
      "sites/**",
      "website/**",
    ],
  },
  lint: {
    ignorePatterns: [
      ".wrangler/**",
      "app/**",
      "convex/signIn/**",
      "dist/**",
      "move out/**",
      "scripts/**",
      "sites/**",
      "website/**",
    ],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    overrides: [
      {
        files: ["DS1/**/ds-*.ts"],
        rules: { "typescript/unbound-method": "off" },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    maxWorkers: 4,
    fileParallelism: !process.env.CI,
    clearMocks: false,
    exclude: ["**/node_modules/**", "**/.git/**"],
  },
  root: ".",
  server: {
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "design-system-1": "./DS1",
    },
  },
});
