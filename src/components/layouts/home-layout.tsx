import { Suspense, type PropsWithChildren } from "react";
import { Outlet } from "react-router";
import { FadeInContent } from "../fade-in-content";
import { PrefetchLink } from "../prefetch-link";

export function HomeLayout({ children }: PropsWithChildren) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4">
          <li>
            <PrefetchLink to="/" className="hover:text-gray-300">
              Home
            </PrefetchLink>
          </li>
          <li>
            <PrefetchLink to="/about" className="hover:text-gray-300">
              About
            </PrefetchLink>
          </li>
          <li>
            <PrefetchLink to="/about/ssr" className="hover:text-gray-300">
              About SSR
            </PrefetchLink>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <Suspense fallback={null}>
          <FadeInContent>
            {/* If HomeLayout wraps specific components, Outlet might not be needed here anymore or replaced by children */}
            {/* For now, assuming children are the page content to be rendered directly */}
            {children ?? <Outlet />}
          </FadeInContent>
        </Suspense>
      </div>
    </>
  );
}
