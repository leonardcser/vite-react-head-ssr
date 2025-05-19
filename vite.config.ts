import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dualBuildPlugin } from "./vite-plugin-dual-build";
import tailwindcss from "@tailwindcss/vite";

const ReactCompilerConfig = {};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
    dualBuildPlugin(),
  ],
  // Note: The top-level `build.outDir` (if any) will be used as the base by dualBuildPlugin.
  // If not specified, it defaults to 'dist'.
});
