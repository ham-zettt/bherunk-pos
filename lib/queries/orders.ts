import "server-only";
import { db } from "@/lib/db";

export interface OrderRow {
  id: string;
  status: "IN_QUEUE" | "PREPARING" | "COMPLETED";
  totalAmount: string;
  cashierName: string;
  itemCount: number;
  createdAt: string;
}

export interface OrdersInRange {
  orders: OrderRow[];
  count: number;
  revenue: number;
}

function startOfLocalDay(offsetDays = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDays);
  return d;
}

/**
 * Parse a yyyy-mm-dd form value into a local-midnight Date.
 * Returns null for absent/invalid input.
 */
export function parseDateParam(value: string | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO yyyy-mm-dd for date inputs (local calendar date). */
export function toInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * All orders with createdAt in [from, to] inclusive (both local calendar
 * days; `to` is extended to end-of-day). Absent bounds fall back to today.
 */
export async function getOrdersInRange(
  from?: Date | null,
  to?: Date | null,
): Promise<OrdersInRange> {
  const gte = from ?? startOfLocalDay(0);
  const toStart = to ?? startOfLocalDay(0);
  const lt = new Date(toStart);
  lt.setDate(lt.getDate() + 1);

  const where = { createdAt: { gte, lt } };

  const [orders, agg] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        cashier: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    db.order.aggregate({ where, _sum: { totalAmount: true }, _count: { id: true } }),
  ]);

  return {
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: String(o.totalAmount),
      cashierName: o.cashier.name,
      itemCount: o._count.orderItems,
      createdAt: o.createdAt.toISOString(),
    })),
    count: agg._count.id,
    revenue: Math.round(Number(agg._sum.totalAmount ?? 0)),
  };
}
