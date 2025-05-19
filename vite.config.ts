import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactHeadSsr } from "./vite-plugin-react-head-ssr";
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
    reactHeadSsr(),
  ],
});
