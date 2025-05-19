import { type PropsWithChildren } from "react";
import { Outlet, Link } from "react-router";

export function HomeLayout({ children }: PropsWithChildren) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300">
              About
            </Link>
          </li>
          <li>
            <Link to="/about/ssr" className="hover:text-gray-300">
              About SSR
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        {/* If HomeLayout wraps specific components, Outlet might not be needed here anymore or replaced by children */}
        {/* For now, assuming children are the page content to be rendered directly */}
        {children ?? <Outlet />}
      </div>
    </>
  );
}
