import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmployeesView } from "@/components/employees/employees-view";
import type { EmployeeRow } from "@/components/employees/types";
import { isRole } from "@/lib/constants";

export const metadata = { title: "Karyawan | Sistem Kafe D'BHERUNK" };

export default async function EmployeesPage() {
  const session = await requireRole("ADMIN");

  // Password hash deliberately never selected.
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      orders: { orderBy: { createdAt: "desc" as const }, take: 1, select: { createdAt: true } },
    },
  });

  const rows: EmployeeRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: isRole(u.role) ? u.role : "CASHIER",
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    lastOrderAt: u.orders[0]?.createdAt.toISOString() ?? null,
  }));

  return <EmployeesView employees={rows} currentUserId={session.userId} />;
}
