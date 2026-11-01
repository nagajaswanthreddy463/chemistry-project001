import inter400 from "@fontsource/inter/400.css?url";
import inter500 from "@fontsource/inter/500.css?url";
import inter600 from "@fontsource/inter/600.css?url";
import poppins500 from "@fontsource/poppins/500.css?url";
import poppins600 from "@fontsource/poppins/600.css?url";
import poppins700 from "@fontsource/poppins/700.css?url";
import poppins800 from "@fontsource/poppins/800.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteFooter, SiteHeader } from "@/components/lab/Layout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">This experiment doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for has moved or never existed.</p>
        <Link to="/" className="bg-hero-btn mt-6 inline-flex rounded-full px-5 py-2 text-sm font-medium">Back to the lab</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-hero-btn rounded-full px-5 py-2 text-sm">Try again</button>
          <a href="/" className="rounded-full px-5 py-2 text-sm ring-1 ring-border">Go home</a>
        </div>
      </div>
    </div>
  );
}

// Fonts are bundled from npm (@fontsource) so the app works offline.
const FONT_CSS = [inter400, inter500, inter600, poppins500, poppins600, poppins700, poppins800];

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cheminformatics Virtual Laboratory" },
      { name: "description", content: "An interactive cheminformatics lab: SMILES, 2D/3D visualisation, descriptors and reports." },
      { name: "author", content: "Ustelamuri Naga Jaswanth Reddy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      ...FONT_CSS.map((href) => ({ rel: "stylesheet", href })),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      <main key={path} className="animate-rise min-h-[70vh]">
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
