import { defineConfig } from "vite-plus";
import { resolve } from "path";

const isMinified = process.env.MINIFY === "true";
const isFeedback = process.env.FEEDBACK === "true";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, isFeedback ? "DS1/0-face/feedback.ts" : "DS1/index.ts"),
      name: "DsOne",
      formats: ["es"],
      fileName: () => (isFeedback ? "feedback.js" : isMinified ? "design-system-1.bundle.min.js" : "design-system-1.bundle.js"),
    },
    minify: isMinified ? "esbuild" : false,
    sourcemap: true,
    ...(isFeedback ? { rollupOptions: { output: { codeSplitting: false } } } : {}),
    target: "es2020",
  },
  resolve: {
    alias: {
      "design-system-1": resolve(__dirname, "DS1"),
    },
  },
});
