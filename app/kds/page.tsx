import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Board } from "@/components/kds/board";
import type { KdsOrder } from "@/hooks/use-order-polling";

export const metadata = { title: "Dapur (KDS) | Sistem Kafe D'BHERUNK" };

/** Full-screen KDS board for kitchen staff (and admins). */
export default async function KdsPage() {
  const session = await requireRole("KITCHEN", "ADMIN");

  // Server-rendered first paint; the client hook takes over polling.
  // Server Components run once per request, so reading the clock here is safe
  // (the purity rule targets re-rendering client components only).
  // eslint-disable-next-line react-hooks/purity -- per-request clock read
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

  const initialOrders: KdsOrder[] = orders.map((o) => ({
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

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-[2px] text-ink">
            D&rsquo;Bherunk
          </span>
          <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
            Kitchen Display
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted sm:inline">
            {session.name}
          </span>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Keluar"
              title="Keluar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-focus/50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4 lg:p-6">
        <Board initialOrders={initialOrders} />
      </main>
    </div>
  );
}
