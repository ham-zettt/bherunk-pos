export const ROLES = ["ADMIN", "CASHIER", "KITCHEN"] as const;

export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = ["IN_QUEUE", "PREPARING", "COMPLETED"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH", "QRIS"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Home route for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard",
  CASHIER: "/pos",
  KITCHEN: "/kds",
};

/** Route prefixes each role is allowed to access (enforced by proxy.ts + requireRole). */
export const ROLE_ALLOWED_PREFIXES: Record<Role, string[]> = {
  ADMIN: ["/dashboard", "/inventory", "/employees", "/orders", "/pos", "/kds"],
  CASHIER: ["/pos", "/orders"],
  KITCHEN: ["/kds"],
};

export interface SessionUser {
  userId: string;
  role: Role;
  name: string;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
