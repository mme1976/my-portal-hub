import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Mail, Lock, ArrowRight, ShieldCheck, Database, BarChart3, GraduationCap, User as UserIcon, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";
import logoUrl from "@/assets/dgeec-logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Acesso · DGEEC SafeCenter" }] }),
});

type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Sessão iniciada com sucesso");
        void navigate({ to: "/dashboard" });
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName, institution },
          },
        });
        if (error) throw error;
        toast.success("Conta criada — verifique o seu email para confirmar.");
        setMode("login");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-tonal-lg lg:grid-cols-2">
        {/* Left — Brand */}
        <aside className="relative overflow-hidden bg-gradient-primary p-10 text-on-primary md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="DGEEC SafeCenter"
                width={1024}
                height={1024}
                className="h-14 w-14 flex-none rounded-full bg-white/10 p-0.5 shadow-tonal-sm backdrop-blur"
              />
              <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] opacity-80">
                DGEEC
              </span>
            </div>

            <h1 className="mt-12 font-display text-5xl font-extrabold leading-[1.05]">SafeCenter</h1>
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
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.08em]">{label}</p>
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
            {mode === "login" ? "Portal do Investigador" : "Criar Conta de Investigador"}
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant">
            {mode === "login"
              ? "Introduza as suas credenciais institucionais para aceder ao ambiente de análise."
              : "Registe-se com o seu email institucional para solicitar acesso ao SafeCenter."}
          </p>

          <div className="mt-6 inline-flex rounded-lg bg-surface-container-highest p-1 text-sm w-fit">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "rounded-md bg-surface-container-lowest px-4 py-1.5 font-semibold text-on-surface shadow-tonal-sm"
                  : "px-4 py-1.5 text-on-surface-variant"
              }
            >
              Iniciar sessão
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={
                mode === "signup"
                  ? "rounded-md bg-surface-container-lowest px-4 py-1.5 font-semibold text-on-surface shadow-tonal-sm"
                  : "px-4 py-1.5 text-on-surface-variant"
              }
            >
              Criar conta
            </button>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <Field label="Nome Completo" htmlFor="fullName" Icon={UserIcon}>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Ana Almeida"
                    className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  />
                </Field>
                <Field label="Instituição" htmlFor="institution" Icon={Building2}>
                  <input
                    id="institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Universidade de Lisboa"
                    className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  />
                </Field>
              </>
            )}

            <Field label="E-mail Institucional" htmlFor="email" Icon={Mail}>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@instituicao.pt"
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
              />
            </Field>

            <Field label="Palavra-Passe" htmlFor="password" Icon={Lock}>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-transparent text-sm text-on-surface outline-none"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-6 py-3.5 font-display text-sm font-semibold text-on-primary shadow-tonal transition-all hover:shadow-tonal-lg active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "A processar…" : mode === "login" ? "Entrar no Sistema" : "Criar Conta"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <Link
              to="/home"
              className="rounded-xl bg-surface-container-low p-5 text-center transition-colors hover:bg-surface-container-highest"
            >
              <p className="font-display text-sm font-semibold text-on-surface">Conhecer SafeCenter</p>
              <p className="mt-1 text-xs text-on-surface-variant">Página pública</p>
            </Link>
            <a
              href="mailto:safecenter@dgeec.pt"
              className="rounded-xl bg-surface-container-low p-5 text-center transition-colors hover:bg-surface-container-highest"
            >
              <p className="font-display text-sm font-semibold text-on-surface">Suporte Técnico</p>
              <p className="mt-1 text-xs text-on-surface-variant">Equipa de curadoria</p>
            </a>
          </div>

          <footer className="mt-10 text-center text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant">
            © 2024 DGEEC SafeCenter · Ministério da Educação, Ciência e Inovação
          </footer>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  Icon,
  children,
}: {
  label: string;
  htmlFor: string;
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-eyebrow" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-md bg-surface-container-highest px-4 py-3 outline outline-2 outline-transparent focus-within:outline-primary">
        <Icon className="h-4 w-4 text-on-surface-variant" />
        {children}
      </div>
    </div>
  );
}
