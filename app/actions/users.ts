"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { Role } from "@/lib/constants";

const CreateEmployeeSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(100),
  email: z.email({ error: "Please enter a valid email address." }).max(254),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .max(72, { error: "Password must be at most 72 characters." }),
  role: z.enum(["ADMIN", "CASHIER", "KITCHEN"], {
    error: "Please pick a role.",
  }),
});

export type EmployeeFormState = {
  errors?: Partial<Record<"name" | "email" | "password" | "role", string[]>>;
  message?: string;
  ok?: boolean;
};

export async function createEmployee(
  _prev: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  await requireRole("ADMIN");

  const parsed = CreateEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as EmployeeFormState["errors"],
      message: "Please fix the highlighted fields.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  const duplicate = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (duplicate) {
    return {
      errors: { email: ["An account with this email already exists."] },
      message: "Please fix the highlighted fields.",
    };
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    // Password hash never selected back into app code paths.
    await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        password: passwordHash,
        role: parsed.data.role satisfies Role,
      },
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return {
        errors: { email: ["An account with this email already exists."] },
        message: "Please fix the highlighted fields.",
      };
    }
    throw err;
  }

  revalidatePath("/employees");
  return { ok: true };
}
