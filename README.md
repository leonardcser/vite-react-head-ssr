# Vite + React SSR Head / CSR Body Demo

This project demonstrates a Vite + React setup for Server-Side Rendering (SSR) of the HTML `<head>` and Client-Side Rendering (CSR) of the HTML `<body>`.
This approach provides SEO benefits and fast perceived initial load times while maintaining a rich client-side React experience.

## Key Features

- **SSR for `<head>`**: Improves SEO and initial load by sending metadata (`<title>`, `<meta>` tags) with the initial HTML.
- **CSR for `<body>`**: Leverages React for dynamic interactivity.
- **Dynamic Head Content**: `<head>` content updates per route, supporting URL parameters.
- **`react-router` v7**: For routing on server and client.
- **Vite**: Fast development and optimized builds.
- **Express.js Server**: Handles SSR logic.
- **Dual Build Process**: Custom Vite plugin (`vite-plugin-react-head-ssr.ts`) for separate client/server builds.
- **Tailwind CSS**: For styling.

## How it Works

1.  **Request Handling (`server.ts`)**:

    - Express server listens for requests.
    - Dev: Uses Vite dev server to load `src/entry-server.tsx`.
    - Prod: Serves static assets from `dist/client` and loads server bundle from `dist/server/entry-server.js`.
    - Reads `index.html` template and calls `render` from `src/entry-server.tsx`.

2.  **Server-Side Rendering (`src/entry-server.tsx`)**:

    - `render` function uses `react-router`'s `createStaticHandler` to match URL to routes.
    - Extracts head info from matched route's `handle.head` (defined in `src/routes.tsx`).
    - `ReactDOMServer.renderToString` renders head React elements to an HTML string (`headHtml`).
    - `headHtml` is returned to `server.ts`.

3.  **HTML Template (`index.html`)**:

    - Contains `<!--app-head-->` and `<!--app-html-->` placeholders.
    - `server.ts` injects `headHtml` into `<!--app-head-->`.
    - `<!--app-html-->` is initially empty; body renders client-side into `<div id="root"></div>`.
    - Loads client-side app via `<script type="module" src="/src/entry-client.tsx"></script>`.

4.  **Client-Side Rendering (`src/entry-client.tsx`)**:

    - Client-side entry point.
    - Uses `react-router`'s `createBrowserRouter` with the same routes.
    - Renders `<App />` into `<div id="root">` using `ReactDOM.createRoot().render()`.

5.  **Route Definitions & Head Management (`src/routes.tsx`)**:

    - Defines routes using `RouteObject`.
    - Each route can have `handle.head` for static or dynamic (function-based) head content.

6.  **Client-Side Head Updates (`src/app.tsx`)**:

    - `<App />` uses `useMatches` and `useLocation` for current route's `handle`.
    - `CurrentRouteHead` component renders head content, updating it on client-side navigation.

7.  **Build Process (`vite-plugin-react-head-ssr.ts` & `vite.config.ts`)**:
    - Custom plugin `vite-plugin-react-head-ssr.ts` orchestrates client and server builds.
    - Client build: outputs to `dist/client`, generates SSR manifest.
    - Server build: (after client build) outputs `src/entry-server.tsx` to `dist/server` as an SSR-optimized ESM bundle.

## Project Structure

```
vite-react-head-ssr/
├── public/                   # Static assets
├── src/
│   ├── assets/               # App-specific assets
│   ├── components/
│   │   ├── head-seo.tsx      # Component for managing head tags
│   │   └── layouts/          # Layout components
│   ├── pages/                # Page components
│   ├── app.tsx               # Main React app (client-side head updates)
│   ├── entry-client.tsx      # Client-side entry
│   ├── entry-server.tsx      # Server-side rendering entry
│   ├── index.css             # Global styles (Tailwind)
│   └── routes.tsx            # Route definitions & head metadata
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html                # Main HTML template
├── package.json
├── pnpm-lock.yaml
├── README.md                 # This file
├── server.ts                 # Express SSR server
├── tsconfig.json
├── vite-plugin-react-head-ssr.ts # Custom Vite plugin for dual builds
└── vite.config.ts            # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (e.g., ^18.0.0 || >=20.0.0)
- pnpm (v10.10.0 or as in `package.json`)

### Installation

1.  Clone: `git clone <repository-url> && cd vite-react-head-ssr`
2.  Install: `pnpm install`

### Development

Start dev server (HMR, server auto-restart):
`pnpm dev`
(App at `http://localhost:5173`)

### Build

Build for production:
`pnpm build`
(Outputs to `dist/client` and `dist/server`)

### Preview Production

Serve production build:
`pnpm preview`

## Key Files for SSR Head Logic

- **`server.ts`**: Orchestrates SSR.
- **`src/entry-server.tsx`**: Core SSR logic for head.
- **`src/routes.tsx`**: Routes and `handle.head` metadata.
- **`src/app.tsx`**: Client-side head updates.
- **`index.html`**: Template with `<!--app-head-->`.
- **`vite-plugin-react-head-ssr.ts`**: Manages dual client/server builds.
- **`vite.config.ts`**: Vite settings.

This setup balances SEO/initial load via SSR head with a dynamic CSR body.
