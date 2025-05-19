import React, { lazy } from "react";
import type { RouteObject, RouterState } from "react-router";
import { HeadSeo } from "./components/head-seo";
import { HomeLayout } from "./components/layouts/home-layout";

// Lazy load page components
const LazyHomePage = lazy(() =>
  import("./pages/home-page").then((module) => ({ default: module.HomePage }))
);
const LazyAboutPage = lazy(() =>
  import("./pages/about-page").then((module) => ({ default: module.AboutPage }))
);

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
  componentIdentifier?: string;
};

export const routes: AppRouteObject[] = [
  {
    path: "/",
    element: (
      <HomeLayout>
        <LazyHomePage />
      </HomeLayout>
    ),
    componentIdentifier: "src/pages/home-page.tsx",
    handle: {
      head: <HeadSeo title="Home" description="This is the home page" />,
    },
  },
  {
    path: "/about",
    element: (
      <HomeLayout>
        <LazyAboutPage />
      </HomeLayout>
    ),
    componentIdentifier: "src/pages/about-page.tsx",
    handle: {
      head: <HeadSeo title="About" description="This is the about page" />,
    },
  },
  {
    path: "/about/:name",
    element: (
      <HomeLayout>
        <LazyAboutPage />
      </HomeLayout>
    ),
    componentIdentifier: "src/pages/about-page.tsx",
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
