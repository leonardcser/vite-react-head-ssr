import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./app";
import { ErrorPage } from "./pages/error-page";
import { routes } from "./routes";
import "./index.css";

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes,
    errorElement: <ErrorPage />,
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}
