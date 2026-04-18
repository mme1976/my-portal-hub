import { createFileRoute, redirect } from "@tanstack/react-router";
import { authSnapshot } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (authSnapshot.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/auth" });
  },
});
