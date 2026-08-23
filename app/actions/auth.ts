"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { ROLE_ALLOWED_PREFIXES, ROLE_HOME, type Role } from "@/lib/constants";
import { LoginSchema, safeRedirectPath, type LoginFormState } from "@/lib/validation";

export async function login(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Generic error for both unknown email and wrong password (no user enumeration).
  if (!user || !(await compare(parsed.data.password, user.password))) {
    return { message: "Invalid email or password." };
  }

  // Correct credentials but deactivated account: explicit, non-enumerating message.
  if (!user.isActive) {
    return { message: "This account has been deactivated. Contact an admin." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });

  redirect(resolvePostLoginPath(user.role, formData.get("redirectTo")));
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

function resolvePostLoginPath(role: Role, redirectTo: FormDataEntryValue | null): string {
  const safe = safeRedirectPath(redirectTo, ROLE_ALLOWED_PREFIXES[role]);
  return safe ?? ROLE_HOME[role];
}
