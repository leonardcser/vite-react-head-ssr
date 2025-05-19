import React, { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, type StaticHandlerContext } from "react-router"; // Use main export
import type { AppRouteObject } from "./routes";
import { routes } from "./routes";

export async function render(
  req: Request,
  manifest?: Record<string, string[]> // Optional SSR manifest
) {
  const handler = createStaticHandler(routes as AppRouteObject[]);
  const fetchRequest = req;

  const context = (await handler.query(fetchRequest)) as StaticHandlerContext;

  if (context instanceof Response) {
    // If a redirect or other Response is thrown, pass it through
    throw context;
  }

  let headHtml = "";
  let preloadLinks = "";

  // Extract head from the matched route if available
  // The context.matches might be undefined if no routes matched, or if it's a data route, etc.
  // For this basic example, we assume context is a RouteMatch array for matched UI routes.
  if (context.matches && context.matches.length > 0) {
    const leafMatch = context.matches[context.matches.length - 1];
    if (leafMatch && leafMatch.route) {
      const routeDefinition = leafMatch.route as AppRouteObject;
      const routeHandle = routeDefinition.handle;

      if (routeHandle?.head) {
        if (typeof routeHandle.head === "function") {
          const headElement = routeHandle.head(leafMatch.params, {
            url: new URL(req.url),
            location: context.location, // location from static handler context
          });
          headHtml = renderToString(<StrictMode>{headElement}</StrictMode>);
        } else {
          headHtml = renderToString(
            <StrictMode>{routeHandle.head as React.ReactElement}</StrictMode>
          );
        }
      }

      // Generate preload links if manifest and componentIdentifier are available
      if (manifest && routeDefinition.componentIdentifier) {
        const componentAssets = manifest[routeDefinition.componentIdentifier];
        if (componentAssets) {
          componentAssets.forEach((asset) => {
            if (asset.endsWith(".js")) {
              preloadLinks += `<link rel="modulepreload" crossorigin href="${asset}">\n`;
            } else if (asset.endsWith(".css")) {
              preloadLinks += `<link rel="stylesheet" href="${asset}">\n`;
            }
          });
        }
      }
    }
  }

  // For this basic demo, we are only server-rendering the head.
  // The main app content will be rendered on the client.
  // To render the app shell, you would use createStaticRouter and StaticRouterProvider here.
  // const router = createStaticRouter(handler.dataRoutes, context);
  // const appHtml = renderToString(
  //   <StrictMode>
  //     <StaticRouterProvider router={router} context={context} nonce="the-nonce" />
  //   </StrictMode>
  // );

  return {
    headHtml,
    preloadLinks, // Return preload links
    context /* appHtml could be returned here if rendering body */,
  };
}
