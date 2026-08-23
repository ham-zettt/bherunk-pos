import type { Role } from "@/lib/constants";

/** Safe DTO — password hash is never selected. */
export interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}
