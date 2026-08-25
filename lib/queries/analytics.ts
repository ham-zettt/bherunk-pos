import "server-only";
import { db } from "@/lib/db";

export interface DayMetrics {
	revenue: number;
	orders: number;
}

export interface DashboardMetrics {
	today: DayMetrics;
	yesterday: DayMetrics;
	lowStockCount: number;
}

function dayStart(offsetDays = 0): Date {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - offsetDays);
	return d;
}

function dayEnd(offsetDays = 0): Date {
	const d = dayStart(offsetDays);
	d.setDate(d.getDate() + 1);
	return d;
}

/**
 * Register-till semantics: every placed order counts toward revenue
 * regardless of kitchen status (a made-but-uncompleted ticket was still
 * paid at the counter). All money crosses as Decimal→string→int rupiah.
 */
async function metricsForDay(start: Date, end: Date): Promise<DayMetrics> {
	const agg = await db.order.aggregate({
		where: { createdAt: { gte: start, lt: end } },
		_sum: { totalAmount: true },
		_count: { id: true },
	});
	const revenue = Math.round(Number(agg._sum.totalAmount ?? 0));
	return { revenue, orders: agg._count.id };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const [today, yesterday, lowStock] = await Promise.all([
		metricsForDay(dayStart(0), dayEnd(0)),
		metricsForDay(dayStart(1), dayEnd(1)),
		db.product.count({ where: { stock: { lt: 5 } } }),
	]);
	return { today, yesterday, lowStockCount: lowStock };
}

export interface TopMenuRow {
	productId: string;
	name: string;
	qtySold: number;
}

/** Best-selling menus by total units bought, calendar-month to date. */
export async function getTopMenusThisMonth(limit = 3): Promise<TopMenuRow[]> {
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);

	const grouped = await db.orderItem.groupBy({
		by: ["productId"],
		where: { order: { createdAt: { gte: monthStart } } },
		_sum: { quantity: true },
		orderBy: { _sum: { quantity: "desc" } },
		take: limit,
	});

	if (grouped.length === 0) return [];

	const products = await db.product.findMany({
		where: { id: { in: grouped.map((g) => g.productId) } },
		select: { id: true, name: true },
	});
	const nameById = new Map(products.map((p) => [p.id, p.name]));

	return grouped.map((g) => ({
		productId: g.productId,
		name: nameById.get(g.productId) ?? "Unknown",
		qtySold: g._sum.quantity ?? 0,
	}));
}

export interface RecentOrderRow {
	id: string;
	status: "IN_QUEUE" | "PREPARING" | "COMPLETED";
	totalAmount: string;
	cashierName: string;
	itemCount: number;
	createdAt: string;
}

/** Latest orders (any status) with cashier attribution and item counts. */
export async function getRecentOrders(limit = 10): Promise<RecentOrderRow[]> {
	const orders = await db.order.findMany({
		orderBy: { createdAt: "desc" },
		take: limit,
		select: {
			id: true,
			status: true,
			totalAmount: true,
			createdAt: true,
			cashier: { select: { name: true } },
			_count: { select: { orderItems: true } },
		},
	});
	return orders.map((o) => ({
		id: o.id,
		status: o.status,
		totalAmount: String(o.totalAmount),
		cashierName: o.cashier.name,
		itemCount: o._count.orderItems,
		createdAt: o.createdAt.toISOString(),
	}));
}

export interface StockRow {
	id: string;
	name: string;
	categoryName: string;
	stock: number;
}

/** All products, lowest stock first — low-stock items surface naturally. */
export async function getStockLevels(): Promise<StockRow[]> {
	const products = await db.product.findMany({
		where: { stock: { lt: 5 } },
		orderBy: [{ stock: "asc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			stock: true,
			category: { select: { name: true } },
		},
	});
	return products.map((p) => ({
		id: p.id,
		name: p.name,
		categoryName: p.category.name,
		stock: p.stock,
	}));
}
