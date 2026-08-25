"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { Role } from "@/lib/constants";

const CreateEmployeeSchema = z.object({
  name: z.string().trim().min(1, { error: "Nama wajib diisi." }).max(100),
  email: z.email({ error: "Masukkan alamat email yang valid." }).max(254),
  password: z
    .string()
    .min(8, { error: "Kata sandi minimal 8 karakter." })
    .max(72, { error: "Kata sandi maksimal 72 karakter." }),
  role: z.enum(["ADMIN", "CASHIER", "KITCHEN"], {
    error: "Silakan pilih role.",
  }),
});

const UpdateEmployeeSchema = z.object({
  employeeId: z.uuid(),
  name: z.string().trim().min(1, { error: "Nama wajib diisi." }).max(100),
  role: z.enum(["ADMIN", "CASHIER", "KITCHEN"], {
    error: "Silakan pilih role.",
  }),
  // Blank = keep current password.
  newPassword: z.union([
    z.literal(""),
    z
      .string()
      .min(8, { error: "Kata sandi baru minimal 8 karakter." })
      .max(72, { error: "Kata sandi baru maksimal 72 karakter." }),
  ]),
});

/** True when only one active ADMIN exists (guard against demoting/deactivating them). */
async function isLastActiveAdmin(): Promise<boolean> {
  const activeAdmins = await db.user.count({
    where: { role: "ADMIN", isActive: true },
  });
  return activeAdmins <= 1;
}

export async function updateEmployee(
  _prev: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await requireRole("ADMIN");

  const parsed = UpdateEmployeeSchema.safeParse({
    employeeId: formData.get("employeeId"),
    name: formData.get("name"),
    role: formData.get("role"),
    newPassword: formData.get("newPassword") ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as EmployeeFormState["errors"],
      message: "Perbaiki kolom yang ditandai.",
    };
  }

  const target = await db.user.findUnique({
    where: { id: parsed.data.employeeId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) {
    return { message: "Karyawan sudah tidak ada. Muat ulang lalu coba lagi." };
  }

  if (target.id === session.userId && parsed.data.role !== "ADMIN") {
    return { errors: { role: ["Anda tidak dapat mengubah peran sendiri."] }, message: "Perbaiki kolom yang ditandai." };
  }
  if (
    target.role === "ADMIN" &&
    parsed.data.role !== "ADMIN" &&
    (await isLastActiveAdmin())
  ) {
    return { errors: { role: ["Tidak dapat menurunkan satu-satunya admin aktif."] }, message: "Perbaiki kolom yang ditandai." };
  }

  await db.user.update({
    where: { id: target.id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      ...(parsed.data.newPassword
        ? {
            password: await bcryptHash(parsed.data.newPassword),
          }
        : {}),
    },
  });

  revalidatePath("/employees");
  return { ok: true };
}

/**
 * Activate/deactivate an employee. Plain form action (returns void so it can
 * post progressively without JS). Deactivated users are bounced to /login on
 * their next request by requireSession; their past orders stay attributed.
 * Guards run server-side; when rejected the row simply stays unchanged after
 * revalidation.
 */
export async function setEmployeeActive(formData: FormData): Promise<void> {
  const session = await requireRole("ADMIN");

  const parsed = z
    .object({
      employeeId: z.uuid(),
      active: z.enum(["true", "false"]),
    })
    .safeParse({
      employeeId: formData.get("employeeId"),
      active: formData.get("active"),
    });
  if (!parsed.success) return;

  const target = await db.user.findUnique({
    where: { id: parsed.data.employeeId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) return;

  const nextActive = parsed.data.active === "true";
  if (!nextActive) {
    if (target.id === session.userId) return;
    if (target.role === "ADMIN" && (await isLastActiveAdmin())) return;
  }

  await db.user.update({
    where: { id: target.id },
    data: { isActive: nextActive },
  });

  revalidatePath("/employees");
}

export type EmployeeFormState = {
  errors?: Partial<Record<"name" | "email" | "password" | "role" | "newPassword", string[]>>;
  message?: string;
  ok?: boolean;
};

async function bcryptHash(plain: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(plain, 10);
}

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
      message: "Perbaiki kolom yang ditandai.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  const duplicate = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (duplicate) {
    return {
      errors: { email: ["Akun dengan email ini sudah ada."] },
      message: "Perbaiki kolom yang ditandai.",
    };
  }

  const passwordHash = await bcryptHash(parsed.data.password);

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
        errors: { email: ["Akun dengan email ini sudah ada."] },
        message: "Perbaiki kolom yang ditandai.",
      };
    }
    throw err;
  }

  revalidatePath("/employees");
  return { ok: true };
}
