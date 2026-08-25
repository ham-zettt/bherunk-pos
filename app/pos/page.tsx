import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PosView } from "@/components/pos/pos-view";
import type { PosCategory, PosProduct } from "@/components/pos/types";
import type { KdsOrder } from "@/hooks/use-order-polling";

export const metadata = { title: "Kasir | Sistem Kafe D'BHERUNK" };

/** Full-screen POS for cashiers (and admins per decision #2). */
export default async function PosPage() {
  const session = await requireRole("CASHIER", "ADMIN");

  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { name: "asc" },
      include: { category: { select: { name: true } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  // Decimal -> string at the boundary (plan decision #8).
  const posProducts: PosProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: String(p.price),
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: p.category.name,
  }));
  const posCategories: PosCategory[] = categories;

  // Initial data for the cashier's live recent-orders strip.
  // Server Components run once per request, so reading the clock here is safe.
  // eslint-disable-next-line react-hooks/purity -- per-request clock read
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const recent = await db.order.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, status: true, createdAt: true, totalAmount: true },
  });
  const initialRecent: KdsOrder[] = recent.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    total: String(o.totalAmount),
    items: [],
  }));

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-[2px] text-ink">
            D&rsquo;Bherunk
          </span>
          <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px] font-medium leading-none text-ink-muted">
            Kasir
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

      <main className="flex-1 p-4 lg:p-6">
        <PosView products={posProducts} categories={posCategories} initialRecent={initialRecent} />
      </main>
    </div>
  );
}
