import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="label-eyebrow">SafeCenter</p>
        <h1 className="mt-2 font-display text-7xl font-extrabold text-on-surface">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-on-surface">Página não encontrada</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          A página que procura não existe ou foi movida para outro recurso institucional.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-tonal transition-all hover:shadow-tonal-lg"
          >
            Voltar ao Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DGEEC SafeCenter — Portal de Investigação" },
      {
        name: "description",
        content:
          "Portal de Investigação DGEEC SafeCenter — ambiente seguro para acesso a microdados estatísticos para investigação científica.",
      },
      { name: "author", content: "DGEEC" },
      { property: "og:title", content: "DGEEC SafeCenter — Portal de Investigação" },
      {
        property: "og:description",
        content:
          "Ambiente isolado e de alta segurança para processar conjuntos de dados sensíveis com integridade científica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
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

function RootComponent() {
  return <Outlet />;
}
