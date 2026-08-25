import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import type { Role, SessionUser } from "@/lib/constants";

/**
 * Require an authenticated session inside a Server Component / Action.
 * The JWT cookie is only the transport; identity, role and active status
 * are re-read from the database so role changes and deactivation take
 * effect at the very next request.
 * Redirects to /login when unauthenticated or deactivated.
 */
export async function requireSession(): Promise<SessionUser> {
	const session = await getSession();
	if (!session) redirect("/login");

	const user = await db.user.findUnique({
		where: { id: session.userId },
		select: { id: true, name: true, role: true, isActive: true },
	});
	if (!user || !user.isActive) redirect("/login");

	return { userId: user.id, role: user.role, name: user.name };
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
