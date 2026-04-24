import type { ReactNode } from "react";

type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "neutral" | "tertiary";

const tones: Record<Tone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-highest text-on-surface-variant",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
};

export function StatusChip({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
