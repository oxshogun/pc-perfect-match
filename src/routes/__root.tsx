import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Cpu } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Signal lost</p>
        <h1 className="mt-3 font-mono text-7xl font-bold text-foreground text-glow">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Route not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This slot isn't populated. Head back to the workbench.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to builder
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">System fault</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something shorted out. Reboot the module or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RIG.LAB — PC builder & compatibility checker" },
      {
        name: "description",
        content:
          "Build your PC part-by-part and catch socket, RAM, PSU, case, and connector mismatches before you buy.",
      },
      { property: "og:title", content: "RIG.LAB — PC builder & compatibility checker" },
      {
        property: "og:description",
        content:
          "Assemble builds, run a full compatibility audit, and share your rig with a link.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40 group-hover:glow-primary transition-shadow">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              RIG
            </span>
            <span className="font-mono text-sm font-bold tracking-[0.18em] text-foreground">
              .LAB
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/">Builder</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/builds">Builds</NavLink>
        </nav>
        <div className="ml-auto hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>system nominal</span>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{
        className:
          "px-3 py-1.5 rounded-md text-primary bg-primary/10 font-medium",
      }}
      inactiveProps={{
        className:
          "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors",
      }}
    >
      {children}
    </Link>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border/60 py-4 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          RIG.LAB // hobbyist PC compatibility engine
        </footer>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
