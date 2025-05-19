import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./app";
import { routes } from "./routes";
import "./index.css"; // Assuming you have a basic CSS file

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes,
    // You might want a global error element here too
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
