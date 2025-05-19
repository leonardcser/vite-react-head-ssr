import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url"; // For robust dynamic importing
import express from "express";
// Vite types and server creation are conditionally imported for dev mode
import type { ViteDevServer } from "vite";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = __dirname; // Assuming server.ts is at the project root
const isProduction = process.env.NODE_ENV === "production";
const baseOutDir = "dist"; // Standard output directory base

let ssrManifest: Record<string, string[]> | undefined = undefined;

async function createServer() {
  const app = express();
  let vite: ViteDevServer | undefined;

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      root, // Project root for Vite
      server: { middlewareMode: true },
      appType: "custom",
      publicDir: path.resolve(root, "public"),
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static assets from dist/client
    const clientDistPath = path.resolve(root, baseOutDir, "client");

    // Load SSR manifest in production
    const manifestPath = path.resolve(
      clientDistPath,
      ".vite/ssr-manifest.json"
    );
    try {
      ssrManifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
      console.log("SSR manifest loaded.");
    } catch (e) {
      console.error("Failed to load SSR manifest:", e);
      // Depending on your error handling strategy, you might want to exit or proceed without it
    }

    app.use(
      express.static(clientDistPath, {
        index: false, // Don't serve index.html by default, let the catch-all handle it
      })
    );
  }

  app.use("*all", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template: string;
      let render: (
        req: Request,
        manifest?: Record<string, string[]>
      ) => Promise<{ headHtml: string; preloadLinks?: string }>;

      if (!isProduction && vite) {
        // Development: read and transform index.html, load entry-server via Vite
        template = await fs.readFile(path.resolve(root, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        const serverEntry = await vite.ssrLoadModule("/src/entry-server.tsx");
        render = serverEntry.render;
      } else {
        // Production: read index.html from dist/client, load server bundle from dist/server
        const clientIndexHtmlPath = path.resolve(
          root,
          baseOutDir,
          "client",
          "index.html"
        );
        template = await fs.readFile(clientIndexHtmlPath, "utf-8");

        const serverEntryPath = path.resolve(
          root,
          baseOutDir,
          "server",
          "entry-server.js"
        );
        const serverEntryModule = await import(
          pathToFileURL(serverEntryPath).href
        );
        render = serverEntryModule.render;
      }

      const serverUrl = `${req.protocol}://${req.get("host")}`;
      const fetchRequest = new Request(
        new URL(req.originalUrl, serverUrl).href,
        {
          method: req.method,
          headers: new Headers(req.headers as HeadersInit),
        }
      );

      // Pass ssrManifest to render function in production
      const { headHtml, preloadLinks } = await render(
        fetchRequest,
        isProduction ? ssrManifest : undefined
      );

      const html = template
        .replace(`<!--app-head-->`, `${preloadLinks || ""}${headHtml || ""}`)
        .replace(`<!--app-html-->`, ""); // Body is client-rendered

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (isProduction) {
      console.log(`Running in production mode, serving from '${baseOutDir}'.`);
    }
  });
}

createServer();
