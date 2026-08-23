import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { Role, SessionUser } from "@/lib/constants";

/**
 * Require an authenticated session inside a Server Component / Action.
 * Redirects to /login when unauthenticated.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Require a session whose role is one of `roles`. Redirects unauthorized
 * roles to their own home route instead of login (they are authenticated,
 * just not permitted here).
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    redirect(ROLE_HOME[session.role]);
  }
  return session;
}

const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard",
  CASHIER: "/pos",
  KITCHEN: "/kds",
};
