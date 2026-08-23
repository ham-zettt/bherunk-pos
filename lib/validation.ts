import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export function safeRedirectPath(
  raw: FormDataEntryValue | null | undefined,
  allowedPrefixes: readonly string[],
): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  const path = raw.split("?")[0].split("#")[0];
  if (!allowedPrefixes.some((p) => path === p || path.startsWith(`${p}/`))) {
    return null;
  }
  return raw;
}
