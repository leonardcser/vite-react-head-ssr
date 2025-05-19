import { type Plugin, build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export function reactHeadSsr(): Plugin {
  let root: string;
  let isBuild: boolean;
  let resolvedClientOutDir: string;
  let resolvedServerOutDir: string;
  let baseOutDir: string;

  return {
    name: "vite-plugin-dual-build",
    config(config, { command }) {
      isBuild = command === "build";
      if (isBuild) {
        root = config.root || process.cwd();
        baseOutDir = config.build?.outDir || "dist";

        resolvedClientOutDir = path.resolve(root, baseOutDir, "client");
        resolvedServerOutDir = path.resolve(root, baseOutDir, "server");

        // Configure main build for the client
        config.build = {
          ...config.build,
          outDir: resolvedClientOutDir,
        };
      }
      return config;
    },
    async closeBundle() {
      if (!isBuild || !resolvedServerOutDir) return;

      console.log(`Client build complete: ${resolvedClientOutDir}`);
      console.log(`Starting server build for: ${resolvedServerOutDir}...`);

      try {
        await viteBuild({
          root,
          configFile: false,
          publicDir: false,
          build: {
            ssr: "src/entry-server.tsx",
            outDir: resolvedServerOutDir,
            minify: process.env.NODE_ENV === "production",
            emptyOutDir: true,
            rollupOptions: {
              output: {
                format: "esm",
              },
              external: ["express", /^node:/],
            },
          },
          plugins: [react()],
        });
        console.log("Server build complete.");
      } catch (error) {
        console.error("Server build failed:", error);
        process.exit(1);
      }
    },
  };
}
