import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authSnapshot } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // Wait until auth has been bootstrapped at least once
    if (!authSnapshot.loading && !authSnapshot.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
