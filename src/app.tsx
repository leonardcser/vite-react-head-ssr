import React from "react";
import { Outlet, useLocation, useMatches } from "react-router";
import type { RouteHandle } from "./routes";

function CurrentRouteHead() {
  const matches = useMatches();
  const location = useLocation();
  const lastMatch = matches[matches.length - 1];
  const handle = lastMatch?.handle as RouteHandle | undefined;

  if (handle?.head) {
    if (typeof handle.head === "function") {
      return handle.head(lastMatch.params, {
        url: new URL(location.pathname, window.location.origin),
        location,
      });
    }
    return handle.head as React.ReactElement;
  }
  return null;
}

export function App() {
  return (
    <>
      <CurrentRouteHead />
      <Outlet />
    </>
  );
}
