import type { Role } from "@/lib/constants";

/** Safe DTO — password hash is never selected. */
export interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  /** Latest order timestamp (ISO) or null when the employee has no orders. */
  lastOrderAt: string | null;
}
