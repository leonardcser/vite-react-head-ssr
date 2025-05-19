import React from "react";
import type { RouteObject, RouterState } from "react-router";
import { HeadSeo } from "./components/head-seo";
import { AboutPage } from "./pages/about-page";
import { HomePage } from "./pages/home-page";

export interface RouteHandle {
  head?:
    | React.ReactElement
    | ((
        params: Readonly<Record<string, string | undefined>>,
        context: {
          url: URL;
          location: RouterState["location"];
        }
      ) => React.ReactElement);
}

export type AppRouteObject = RouteObject & {
  handle?: RouteHandle;
};

export const routes: AppRouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
    handle: {
      head: <HeadSeo title="Home" description="This is the home page" />,
    },
  },
  {
    path: "/about",
    element: <AboutPage />,
    handle: {
      head: <HeadSeo title="About" description="This is the about page" />,
    },
  },
  {
    path: "/about/:name",
    element: <AboutPage />,
    handle: {
      head: (params) => (
        <HeadSeo
          title={`About ${params.name}`}
          description={`About page for ${params.name}`}
        />
      ),
    },
  },
];
