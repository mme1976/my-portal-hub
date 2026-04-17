import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Database,
  FilePlus2,
  ShieldCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  HelpCircle,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/pedidos/novo", label: "Novo Pedido", icon: FilePlus2 },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/analises", label: "Análises", icon: BarChart3 },
  { to: "/administracao", label: "Administração", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col bg-surface-container-low px-4 py-6 lg:flex">
        <Link to="/dashboard" className="mb-10 flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-on-primary shadow-tonal">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-extrabold leading-none text-on-surface">
              DGEEC
            </p>
            <p className="font-display text-base font-extrabold leading-tight text-on-surface">
              SafeCenter
            </p>
            <p className="mt-1 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
              Portal de Investigação
            </p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 text-sm">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "flex items-center gap-3 rounded-lg bg-surface-container-lowest px-3 py-2.5 font-semibold text-primary shadow-tonal-sm"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface transition-colors hover:bg-surface-container-highest"
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 text-sm">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            <span>Suporte</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sair</span>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 bg-background/80 px-6 py-4 backdrop-blur-md md:px-12">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              placeholder="Pesquisar dados, postos, protocolos…"
              className="w-full rounded-lg bg-surface-container-highest py-2.5 pl-10 pr-4 text-sm text-on-surface outline outline-2 outline-transparent transition-colors placeholder:text-on-surface-variant/70 focus:outline-primary"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <div className="ml-2 hidden text-right md:block">
              <p className="text-sm font-semibold text-on-surface">Dr. Aris Thorne</p>
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                Curador Principal
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-on-primary">
              AT
            </div>
          </div>
        </header>

        <main className="px-6 pb-24 pt-4 md:px-12">{children}</main>
      </div>
    </div>
  );
}
