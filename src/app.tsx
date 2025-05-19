import React from "react";
import { Outlet, useLocation, useMatches } from "react-router";
import type { AppRouteObject } from "./routes";
import { HeadSeo } from "./components/head-seo";

function CurrentRouteHead() {
  const matches = useMatches();
  const location = useLocation();
  // The last match is the most specific route match
  const lastMatch = matches[matches.length - 1] as unknown as
    | {
        handle?: AppRouteObject["handle"];
        params: Record<string, string | undefined>;
      }
    | undefined;

  if (lastMatch?.handle?.head) {
    if (typeof lastMatch.handle.head === "function") {
      // Provide a default URL object if window is not defined (e.g., during SSR pre-pass without full DOM)
      const currentUrl =
        typeof window !== "undefined"
          ? new URL(location.pathname, window.location.origin)
          : new URL("http://localhost");
      return lastMatch.handle.head(lastMatch.params, {
        url: currentUrl,
        location,
      });
    }
    return lastMatch.handle.head as React.ReactElement;
  }
  return (
    <HeadSeo
      title="Vite SSR Demo"
      description="A demo of SSR with Vite and React Router."
    />
  );
}

export function App() {
  return (
    <>
      <CurrentRouteHead />
      <Outlet />
    </>
  );
}
