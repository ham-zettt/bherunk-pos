import { NextResponse, type NextRequest } from "next/server";
import { decryptSession } from "@/lib/session-token";
import { ROLE_ALLOWED_PREFIXES, ROLE_HOME } from "@/lib/constants";

const LOGIN_PATH = "/login";

function isAllowed(role: string, pathname: string): boolean {
	const prefixes =
		ROLE_ALLOWED_PREFIXES[role as keyof typeof ROLE_ALLOWED_PREFIXES];
	if (!prefixes) return false;
	return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	const session = await decryptSession(
		request.cookies.get("dbherunk_session")?.value,
	);

	if (!session) {
		const loginUrl = new URL(LOGIN_PATH, request.url);
		loginUrl.searchParams.set("redirect", `${pathname}${search}`);
		return NextResponse.redirect(loginUrl);
	}

	if (!isAllowed(session.role, pathname)) {
		return NextResponse.redirect(
			new URL(ROLE_HOME[session.role], request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/inventory/:path*",
		"/employees/:path*",
		"/orders/:path*",
		"/pos/:path*",
		"/kds/:path*",
	],
};
