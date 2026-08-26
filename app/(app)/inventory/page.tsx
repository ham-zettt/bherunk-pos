import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { InventoryView } from "@/components/inventory/inventory-view";
import type { CategoryOption, ProductRow } from "@/components/inventory/types";

export const metadata = { title: "Menu | Sistem Kafe D'BHERUNK" };

export default async function InventoryPage() {
  await requireRole("ADMIN");

  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { name: "asc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  // Serialize at the boundary: Decimal -> string (plan decision #8).
  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: String(p.price),
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    orderItemCount: p._count.orderItems,
  }));

  const options: CategoryOption[] = categories;

  return <InventoryView products={rows} categories={options} />;
}
