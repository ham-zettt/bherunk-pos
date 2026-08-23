import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import type { OrderStatus, Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ApiOrderItem {
	name: string;
	qty: number;
	note: string | null;
}

interface ApiOrder {
	id: string;
	status: OrderStatus;
	createdAt: string;
	total: string;
	items: ApiOrderItem[];
}

/**
 * GET /api/orders?active=1 — tickets from the last 12h (all statuses).
 * Read-only feed shared by the KDS board and the cashier's recent-orders
 * strip. JSON auth errors instead of redirects so fetch() consumers can
 * handle them cleanly.
 */
export async function GET(request: Request): Promise<NextResponse> {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
	}

	const user = await db.user.findUnique({
		where: { id: session.userId },
		select: { role: true, isActive: true },
	});
	if (!user || !user.isActive) {
		return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
	}
	const allowedRoles: Role[] = ["KITCHEN", "ADMIN", "CASHIER"];
	if (!allowedRoles.includes(user.role)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const url = new URL(request.url);
	if (url.searchParams.get("active") !== "1") {
		return NextResponse.json({ error: "Bad request" }, { status: 400 });
	}

	const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
	const orders = await db.order.findMany({
		where: { createdAt: { gte: since } },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			totalAmount: true,
			orderItems: {
				select: {
					quantity: true,
					notes: true,
					product: { select: { name: true } },
				},
			},
		},
	});

	const payload: ApiOrder[] = orders.map((o) => ({
		id: o.id,
		status: o.status,
		createdAt: o.createdAt.toISOString(),
		total: String(o.totalAmount),
		items: o.orderItems.map((i) => ({
			name: i.product.name,
			qty: i.quantity,
			note: i.notes,
		})),
	}));

	return NextResponse.json(
		{ orders: payload },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
