import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/constants";
import { isRole } from "@/lib/constants";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me");

// Fail fast in production: an unset secret would silently sign forgeable tokens.
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production.");
}

export async function encryptSession(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    const { userId, role, name } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof name !== "string" || !isRole(role)) return null;
    return { userId, role, name };
  } catch {
    return null;
  }
}
