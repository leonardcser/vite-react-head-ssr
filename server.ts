import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express from "express";
import type { ViteDevServer } from "vite";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = __dirname;
const isProduction = process.env.NODE_ENV === "production";
const baseOutDir = "dist";

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

      const { headHtml, preloadLinks } = await render(fetchRequest);

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
