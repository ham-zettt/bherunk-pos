import Link from "next/link";
import { CalendarRange, RotateCcw, Search } from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  getOrdersInRange,
  parseDateParam,
  toInputValue,
} from "@/lib/queries/orders";
import { formatIDR } from "@/lib/format";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export const metadata = { title: "Pesanan | Sistem Kafe D'BHERUNK" };

interface OrdersPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  await requireRole("ADMIN");

  const { from: fromParam, to: toParam } = await searchParams;
  const from = parseDateParam(fromParam);
  const to = parseDateParam(toParam);

  // Default view: today.
  const today = new Date();
  const fromValue = toInputValue(from ?? today);
  const toValue = toInputValue(to ?? today);

  const { orders, count, revenue } = await getOrdersInRange(from, to);
  const sameDay = fromValue === toValue;

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.6px] text-ink">
        Pesanan
      </h1>

      {/* Date-range filter — plain GET form, works without JavaScript. */}
      <form
        method="get"
        aria-label="Filter pesanan berdasarkan tanggal"
        className="flex flex-wrap items-end gap-3 rounded-lg bg-surface-1 border border-hairline p-4"
      >
        <div className="space-y-1.5">
          <label htmlFor="from" className="block text-sm text-ink-muted">
            Dari
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={fromValue}
            className="rounded-md bg-surface-2 border border-hairline px-3 py-2 text-sm text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="to" className="block text-sm text-ink-muted">
            Sampai
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={toValue}
            className="rounded-md bg-surface-2 border border-hairline px-3 py-2 text-sm text-ink outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
          />
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Terapkan
        </button>
        <Link
          href="/orders"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-surface-2 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-hairline-strong border border-transparent"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Atur ulang
        </Link>

        <p className="ml-auto flex items-center gap-1.5 text-sm tabular-nums text-ink-subtle">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          {count} pesanan · Total {formatIDR(String(revenue))}
          {sameDay ? " · 1 hari" : ` · ${diffDays(fromValue, toValue)} hari`}
        </p>
      </form>

      {orders.length === 0 ? (
        <p
          role="status"
          className="rounded-lg bg-surface-1 border border-hairline p-12 text-center text-sm text-ink-subtle"
        >
          Tidak ada pesanan pada rentang tanggal ini.
        </p>
      ) : (
        <RecentOrders orders={orders} />
      )}
    </div>
  );
}

function diffDays(fromValue: string, toValue: string): number {
  const a = new Date(fromValue);
  const b = new Date(toValue);
  const days = Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
  return days > 0 ? days : 1;
}
