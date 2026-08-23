import "server-only";
import { db } from "@/lib/db";

export interface DayMetrics {
  revenue: number;
  orders: number;
  avgTicket: number;
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
  const orders = agg._count.id;
  return {
    revenue,
    orders,
    avgTicket: orders > 0 ? Math.round(revenue / orders) : 0,
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [today, yesterday, lowStock] = await Promise.all([
    metricsForDay(dayStart(0), dayEnd(0)),
    metricsForDay(dayStart(1), dayEnd(1)),
    db.product.count({ where: { stock: { lt: 10 } } }),
  ]);
  return { today, yesterday, lowStockCount: lowStock };
}
