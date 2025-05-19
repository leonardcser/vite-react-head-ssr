import { Link, type LinkProps, matchRoutes, useLocation } from "react-router";
import { routes, type AppRouteObject } from "../routes"; // Corrected path
import { useCallback } from "react"; // Removed useState as it's not used

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
}

const prefetchedRoutes = new Set<string>();

export function PrefetchLink({ to, children, ...rest }: PrefetchLinkProps) {
  const location = useLocation(); // Needed for matchRoutes if routes are relative

  const handleMouseEnter = useCallback(() => {
    // Ensure 'to' is a string for path matching and set key
    let path: string;
    if (typeof to === "string") {
      path = to;
    } else if (to && typeof to.pathname === "string") {
      path = to.pathname;
    } else {
      console.warn(
        "PrefetchLink: 'to' prop is not a valid path string or object with pathname."
      );
      return;
    }

    if (prefetchedRoutes.has(path)) {
      return;
    }

    // Note: matchRoutes requires a location object that matches what it expects.
    // For simple absolute paths, a minimal location might work.
    // If you have complex relative paths, ensure the location passed to matchRoutes is appropriate.
    // Or, ensure your `routes` definition uses absolute paths primarily.
    const matchedRoutes = matchRoutes(routes as AppRouteObject[], {
      pathname: path,
    });

    if (matchedRoutes && matchedRoutes.length > 0) {
      // Get the most specific match, which is the last one
      const leafMatch = matchedRoutes[matchedRoutes.length - 1];
      // Ensure route and handle exist
      const route = leafMatch.route as AppRouteObject;
      const routeHandler = route?.handle;

      if (routeHandler?.prefetchComponent) {
        routeHandler
          .prefetchComponent()
          .then(() => {
            prefetchedRoutes.add(path);
            console.log(`Prefetched: ${path}`);
          })
          .catch((err: Error) => {
            console.error(`Failed to prefetch ${path}:`, err);
          });
      }
    }
  }, [to, location]); // location dependency might be broad if not careful

  return (
    <Link to={to} onMouseEnter={handleMouseEnter} {...rest}>
      {children}
    </Link>
  );
}
