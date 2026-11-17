import { defineConfig, loadEnv } from "vite-plus";
import { resolve } from "node:path";

const envDir = resolve(__dirname, "..");

export default defineConfig(({ command, mode }) => {
  if (command === "build" && mode === "production" && !process.env.VITE_CONVEX_URL && !loadEnv(mode, envDir, "VITE_").VITE_CONVEX_URL) {
    throw new Error("VITE_CONVEX_URL is not set: copy .env.local into this checkout or set it before building the app.");
  }
  return {
    base: "/app/",

    envDir,

    build: {
      outDir: "../website/dist/app",
      emptyOutDir: true,
    },

    server: {
      fs: {
        allow: [resolve(__dirname, "..")],
      },
    },
  };
});
