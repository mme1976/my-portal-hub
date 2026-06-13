import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useProtocolo } from "@/lib/auth/protocolo-context";
import logoUrl from "@/assets/dgeec-logo.png";

const baseNav = [
  { to: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/pedidos/novo", label: "Novo Pedido", icon: FilePlus2 },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/analises", label: "Análises", icon: BarChart3 },
] as const;

const adminNavItem = { to: "/administracao", label: "Administração", icon: ShieldCheck } as const;

const topTabs = [
  { id: "painel", label: "Painel", paths: ["/dashboard", "/agendamentos", "/pedidos"] },
  { id: "investigacao", label: "Investigação", paths: ["/datasets", "/analises"] },
  { id: "arquivo", label: "Arquivo", paths: ["/administracao"] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { profile, user, signOut, hasRole } = useAuth();

  const activeTab = topTabs.find((t) => t.paths.some((p) => path.startsWith(p)))?.id ?? "painel";

  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Investigador";
  const role = hasRole("admin") ? "Administrador" : profile?.position || "Investigador";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "??";

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col bg-surface-container-low px-4 py-6 lg:flex">
        <Link to="/dashboard" className="mb-10 flex items-center gap-3 px-3">
          <img
            src={logoUrl}
            alt="DGEEC SafeCenter"
            width={1024}
            height={1024}
            loading="lazy"
            className="h-12 w-12 flex-none rounded-full shadow-tonal-sm"
          />
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
          {[...baseNav, ...(hasRole("admin") ? [adminNavItem] : [])].map((item) => {
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
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest text-left"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-6 gap-y-3 bg-background/80 px-6 py-4 backdrop-blur-md md:px-12">
          {/* Top tabs */}
          <nav className="order-1 flex items-center gap-1 text-sm md:order-none" aria-label="Secções principais">
            {topTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <span
                  key={tab.id}
                  className={
                    isActive
                      ? "relative px-3 py-2 font-semibold text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary"
                      : "px-3 py-2 font-medium text-on-surface-variant transition-colors hover:text-on-surface"
                  }
                >
                  {tab.label}
                </span>
              );
            })}
          </nav>

          <div className="order-3 relative flex-1 md:order-none md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              placeholder="Pesquisar dados, postos, protocolos…"
              className="w-full rounded-lg bg-surface-container-highest py-2.5 pl-10 pr-4 text-sm text-on-surface outline outline-2 outline-transparent transition-colors placeholder:text-on-surface-variant/70 focus:outline-primary"
            />
          </div>
          <div className="order-2 ml-auto flex items-center gap-2 md:order-none">
            <ProtocoloSwitcher />
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <div className="ml-2 hidden text-right md:block">
              <p className="text-sm font-semibold text-on-surface">{displayName}</p>
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                {role}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-on-primary">
              {initials}
            </div>
          </div>
        </header>

        <main className="px-6 pb-24 pt-4 md:px-12">{children}</main>
      </div>
    </div>
  );
}

function ProtocoloSwitcher() {
  const { protocolos, activeId, active, setActiveId, loading } = useProtocolo();
  const { hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Admins não precisam de selecionar; mas mostramos um pequeno indicador opcional? Esconde para admins.
  if (hasRole("admin")) return null;
  if (loading) return null;
  if (!protocolos.length) {
    return (
      <span className="hidden md:inline-flex rounded-full bg-warning-container px-3 py-1.5 text-[0.6875rem] font-semibold text-on-warning-container">
        Sem protocolo associado
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-[260px] items-center gap-2 rounded-lg bg-surface-container-highest px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high"
        title="Mudar de protocolo"
      >
        <ShieldCheck className="h-4 w-4 flex-none text-primary" />
        <span className="min-w-0 flex-1 truncate font-semibold">
          {active?.nome ?? "Selecionar protocolo"}
        </span>
        <ChevronDown className={open ? "h-4 w-4 flex-none rotate-180 transition-transform" : "h-4 w-4 flex-none transition-transform"} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[300px] overflow-hidden rounded-xl bg-surface-container-lowest shadow-tonal-lg">
          <p className="label-eyebrow px-4 pt-4">Protocolos a que está associado</p>
          <ul className="mt-2 max-h-[60vh] overflow-y-auto pb-2">
            {protocolos.map((p) => {
              const isActive = p.id === activeId;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setActiveId(p.id);
                      setOpen(false);
                    }}
                    className={
                      isActive
                        ? "flex w-full items-start gap-3 bg-primary/10 px-4 py-3 text-left"
                        : "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-high"
                    }
                  >
                    <ShieldCheck className={isActive ? "h-4 w-4 flex-none text-primary" : "h-4 w-4 flex-none text-on-surface-variant"} />
                    <div className="min-w-0 flex-1">
                      <p className={isActive ? "truncate text-sm font-bold text-primary" : "truncate text-sm font-semibold text-on-surface"}>
                        {p.nome}
                      </p>
                      <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-on-surface-variant">
                        {p.estado === "ativo" ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
