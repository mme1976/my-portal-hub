import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight, Lock, Database, Cpu, Microscope, Wrench } from "lucide-react";
import logoUrl from "@/assets/dgeec-logo.png";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top header */}
      <header className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-6 md:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="DGEEC SafeCenter"
            width={1024}
            height={1024}
            className="h-11 w-11 flex-none rounded-full shadow-tonal-sm"
          />
          <div>
            <p className="font-display text-sm font-extrabold leading-none">DGEEC</p>
            <p className="font-display text-sm font-extrabold leading-tight">SafeCenter</p>
          </div>
        </Link>
        <nav className="ml-auto hidden items-center gap-8 text-sm font-medium text-on-surface md:flex">
          <a className="border-b-2 border-primary pb-1 text-primary" href="#painel">
            Painel
          </a>
          <a className="text-on-surface-variant hover:text-on-surface" href="#investigacao">
            Investigação
          </a>
          <a className="text-on-surface-variant hover:text-on-surface" href="#arquivo">
            Arquivo
          </a>
          <Link
            to="/"
            className="rounded-md bg-surface-container-highest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Aceder ao Portal
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-12 md:pt-16">
        <div className="relative">
          <div className="absolute right-0 top-8 h-72 w-72 rounded-full bg-primary-container/40 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-on-primary-container">
            Ambiente de Computação Seguro
          </span>
          <h1 className="relative mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] text-on-surface md:text-6xl">
            O SafeCenter para Investigação de{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dim bg-clip-text text-transparent">
              Alta Integridade
            </span>
            .
          </h1>
          <p className="relative mt-6 max-w-2xl text-base leading-relaxed text-on-surface-variant">
            O DGEEC SafeCenter oferece aos investigadores um ambiente isolado e de alta segurança
            para processar conjuntos de dados sensíveis. Reserve o seu posto de trabalho dedicado
            para garantir o anonimato total dos dados e conformidade regulamentar.
          </p>

          <div className="relative mt-9 flex flex-wrap gap-3">
            <Link
              to="/agendamentos"
              className="group inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-tonal transition-all hover:shadow-tonal-lg"
            >
              Reservar Posto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#protocolos"
              className="inline-flex items-center gap-2 rounded-md bg-surface-container-highest px-6 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Ver Protocolos
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
            <p className="label-eyebrow">Horário de Funcionamento</p>
            <p className="num-display mt-3 text-4xl font-extrabold text-on-surface">9h30 — 17h00</p>
            <p className="mt-2 text-sm text-on-surface-variant">De Segunda a Sexta-feira</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-outline-variant/15 pt-5">
              <div>
                <p className="num-display text-2xl font-bold text-on-surface">06</p>
                <p className="label-eyebrow mt-1">Total de Postos</p>
              </div>
              <div>
                <p className="num-display text-2xl font-bold text-primary">04</p>
                <p className="label-eyebrow mt-1">Disponíveis Hoje</p>
              </div>
            </div>
          </div>

          {[
            {
              t: "Acesso Imediato",
              d: "O acesso sem marcação prévia é permitido se houver postos vagos, mas a prioridade é estritamente das reservas confirmadas no portal. Recomendamos o agendamento com 48 horas de antecedência.",
            },
            {
              t: "Sessões Prolongadas",
              d: "Investigadores que necessitem de ciclos de computação contínuos de vários dias devem submeter um pedido de variação de protocolo através do separador de administração.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm"
            >
              <p className="font-display text-lg font-semibold text-on-surface">{c.t}</p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Postos */}
      <section className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-on-surface">
              Postos de Trabalho SafeCenter
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Clusters de hardware isolados para computação de alta densidade.
            </p>
          </div>
          <a
            href="#"
            className="hidden text-sm font-semibold text-primary hover:underline md:inline"
          >
            Ver Especificações Técnicas →
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Alpha */}
          <article className="md:col-span-2 lg:col-span-2">
            <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                  <Microscope className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-success-container px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-success-container">
                  Disponível
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-on-surface">
                Posto Alpha-1
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                O nosso posto de trabalho de referência equipado com aceleração GPU dupla e 256GB
                RAM ECC. Otimizado para análise geoespacial de grande escala e treino de redes
                neuronais.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["CPU 64-Core", "Isolamento Físico", "256 GB RAM", "Dual GPU"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-surface-container-low p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-error-container/60 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-error-container">
                Ocupado
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-on-surface">Posto Beta-2</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Otimizado para modelação estatística rápida e conjuntos de dados econométricos.
            </p>
            <p className="label-eyebrow mt-5">Próximo Horário Livre · 14h00</p>
          </article>

          {[
            { n: 3, name: "Gamma-3", desc: "Posto prioritário na revisão de dados censitários individuais.", pct: 0 },
            { n: 4, name: "Gamma-4", desc: "Centro de investigação padrão para estudos longitudinais.", pct: 0 },
            { n: 5, name: "Delta-5", desc: "No seguro para desencriptação de arquivos protegidos.", pct: 60 },
          ].map((p) => (
            <article key={p.name} className="rounded-2xl bg-surface-container-lowest p-6 shadow-tonal-sm">
              <div className="flex items-center gap-3">
                <span className="num-display text-3xl font-extrabold text-primary">{p.n}</span>
                <h4 className="font-display text-lg font-semibold text-on-surface">{p.name}</h4>
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">{p.desc}</p>
              {p.pct > 0 && (
                <div className="mt-4 h-1 w-full rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              )}
            </article>
          ))}

          <article className="flex items-center justify-center rounded-2xl bg-surface-container-low p-6 opacity-60">
            <div className="text-center">
              <Wrench className="mx-auto h-6 w-6 text-on-surface-variant" />
              <h4 className="mt-3 font-display text-lg font-semibold text-on-surface">
                Posto Epsilon-6
              </h4>
              <p className="label-eyebrow mt-2">Em Manutenção</p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
        <div className="overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center text-on-primary shadow-tonal-lg">
          <h2 className="font-display text-4xl font-extrabold">
            Pronto para iniciar a sua sessão?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-on-primary/80">
            Garanta o seu posto hoje e junte-se a mais de 200 instituições que utilizam o DGEEC
            SafeCenter.
          </p>
          <Link
            to="/agendamentos"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-surface-container-lowest px-7 py-3.5 font-display text-sm font-bold text-primary shadow-tonal transition-all hover:shadow-tonal-lg"
          >
            <Lock className="h-4 w-4" />
            Aceder ao Portal de Agendamento
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-20 flex max-w-7xl flex-wrap items-center gap-6 px-6 pb-12 text-xs text-on-surface-variant md:px-12">
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4" />
          <p className="font-display text-sm font-semibold text-on-surface">DGEEC SafeCenter</p>
        </div>
        <p>© 2024 Operações de Investigação</p>
        <div className="ml-auto flex gap-6 uppercase tracking-[0.08em]">
          <a href="#">Privacidade</a>
          <a href="#">Ética</a>
          <a href="#">Termos</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </div>
  );
}
