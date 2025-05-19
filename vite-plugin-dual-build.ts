import { type Plugin, build as viteBuild } from "vite";
import react from "@vitejs/plugin-react"; // Needed for the programmatic server build
import path from "node:path";

// Define ReactCompilerConfig if it's used in your project's react plugin options
const ReactCompilerConfig = {};

export function dualBuildPlugin(): Plugin {
  let root: string;
  let isBuild: boolean;
  let resolvedClientOutDir: string;
  let resolvedServerOutDir: string;
  let baseOutDir: string; // To store the original or default outDir (e.g., 'dist')

  return {
    name: "vite-plugin-dual-build",
    config(config, { command }) {
      isBuild = command === "build";
      if (isBuild) {
        root = config.root || process.cwd();
        baseOutDir = config.build?.outDir || "dist"; // User's configured main outDir or 'dist'

        resolvedClientOutDir = path.resolve(root, baseOutDir, "client");
        resolvedServerOutDir = path.resolve(root, baseOutDir, "server");

        // Configure main build for the client
        config.build = {
          ...config.build,
          outDir: resolvedClientOutDir,
          ssrManifest: true, // Generate SSR manifest for client assets
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
          configFile: false, // Don't load vite.config.js again
          publicDir: false, // Client build handles public directory
          build: {
            ssr: "src/entry-server.tsx", // SSR entry point
            outDir: resolvedServerOutDir,
            minify: process.env.NODE_ENV === "production", // Minify server bundle in production
            emptyOutDir: true, // Clean server output directory before build
            rollupOptions: {
              output: {
                format: "esm", // Output ES module format
              },
              external: ["express", /^node:/], // Externalize Node.js built-ins and Express
            },
          },
          plugins: [
            // Ensure React plugin is configured for server-side JSX/TSX transformation
            react({
              babel: {
                plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
              },
              // The react plugin typically adapts based on build.ssr,
              // explicitly setting ssr: true might be an option if issues arise
            }),
            // Add other essential plugins for the server build if necessary
          ],
        });
        console.log("Server build complete.");
      } catch (error) {
        console.error("Server build failed:", error);
        // Optionally re-throw or handle more gracefully
        // process.exit(1); // Exit if server build is critical
      }
    },
  };
}
