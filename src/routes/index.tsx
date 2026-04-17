import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, ShieldCheck, Database, BarChart3, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-tonal-lg lg:grid-cols-2">
        {/* Left — Brand */}
        <aside className="relative overflow-hidden bg-gradient-primary p-10 text-on-primary md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] opacity-80">
                DGEEC
              </span>
            </div>

            <h1 className="mt-12 font-display text-5xl font-extrabold leading-[1.05]">
              SafeCenter
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-on-primary/85">
              A infraestrutura tecnológica de suporte à investigação científica de excelência em
              Portugal. Acesso a microdados estatísticos com integridade, ética e segurança.
            </p>

            <ul className="mt-12 space-y-5">
              {[
                { Icon: ShieldCheck, label: "Ambiente Seguro", sub: "Isolamento total dos dados" },
                { Icon: Database, label: "Datasets Certificados", sub: "Microdados anonimizados" },
                { Icon: BarChart3, label: "Análise Avançada", sub: "Clusters HPC dedicados" },
              ].map(({ Icon, label, sub }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.08em]">
                      {label}
                    </p>
                    <p className="text-sm text-on-primary/75">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>

            <blockquote className="mt-14 rounded-2xl bg-white/10 p-6 text-sm italic leading-relaxed backdrop-blur">
              <p>
                «O SafeCenter permite o acesso a microdados estatísticos para fins científicos,
                garantindo a proteção da privacidade e o segredo estatístico.»
              </p>
              <footer className="mt-4 flex items-center gap-3 not-italic">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">DGEEC</p>
                  <p className="text-xs opacity-75">
                    Direção-Geral de Estatísticas de Educação e Ciência
                  </p>
                </div>
              </footer>
            </blockquote>
          </div>
        </aside>

        {/* Right — Form */}
        <section className="flex flex-col justify-center px-8 py-12 md:px-16 md:py-20">
          <p className="label-eyebrow">Acesso ao Portal</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold text-on-surface">
            Portal do Investigador
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant">
            Introduza as suas credenciais institucionais para aceder ao ambiente de análise.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/dashboard";
            }}
          >
            <div>
              <label className="label-eyebrow" htmlFor="email">
                E-mail Institucional
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-md bg-surface-container-highest px-4 py-3 outline outline-2 outline-transparent focus-within:outline-primary">
                <Mail className="h-4 w-4 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  defaultValue="aris.thorne@instituicao.pt"
                  placeholder="nome@instituicao.pt"
                  className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label-eyebrow" htmlFor="password">
                  Palavra-Passe
                </label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">
                  Recuperar acesso?
                </a>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-md bg-surface-container-highest px-4 py-3 outline outline-2 outline-transparent focus-within:outline-primary">
                <Lock className="h-4 w-4 text-on-surface-variant" />
                <input
                  id="password"
                  type="password"
                  defaultValue="••••••••••"
                  className="w-full bg-transparent text-sm text-on-surface outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-[var(--primary)]"
              />
              Manter sessão iniciada por 30 dias
            </label>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-6 py-3.5 font-display text-sm font-semibold text-on-primary shadow-tonal transition-all hover:shadow-tonal-lg active:scale-[0.99]"
            >
              Entrar no Sistema
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-12">
            <p className="text-center text-[0.6875rem] uppercase tracking-[0.12em] text-on-surface-variant">
              — Apoio ao Investigador —
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/home"
                className="rounded-xl bg-surface-container-low p-5 text-center transition-colors hover:bg-surface-container-highest"
              >
                <p className="font-display text-sm font-semibold text-on-surface">Conhecer SafeCenter</p>
                <p className="mt-1 text-xs text-on-surface-variant">Página pública</p>
              </Link>
              <a
                href="#"
                className="rounded-xl bg-surface-container-low p-5 text-center transition-colors hover:bg-surface-container-highest"
              >
                <p className="font-display text-sm font-semibold text-on-surface">Suporte Técnico</p>
                <p className="mt-1 text-xs text-on-surface-variant">Equipa de curadoria</p>
              </a>
            </div>
          </div>

          <footer className="mt-12 text-center text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant">
            © 2024 DGEEC SafeCenter · Ministério da Educação, Ciência e Inovação
          </footer>
        </section>
      </div>
    </div>
  );
}
