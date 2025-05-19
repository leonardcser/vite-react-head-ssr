import React, { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, type StaticHandlerContext } from "react-router"; // Use main export
import type { AppRouteObject } from "./routes";
import { routes } from "./routes";

export async function render(req: Request) {
  const handler = createStaticHandler(routes as AppRouteObject[]);
  const fetchRequest = req;

  const context = (await handler.query(fetchRequest)) as StaticHandlerContext;

  if (context instanceof Response) {
    // If a redirect or other Response is thrown, pass it through
    throw context;
  }

  let headHtml = "";

  // Extract head from the matched route if available
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
    }
  }

  return {
    headHtml,
    context /* appHtml could be returned here if rendering body */,
  };
}
