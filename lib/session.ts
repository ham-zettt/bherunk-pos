import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/constants";
import { decryptSession, encryptSession } from "@/lib/session-token";

export const SESSION_COOKIE = "dbherunk_session";
const SESSION_DURATION_S = 7 * 24 * 60 * 60; // 7 days

export async function createSession(user: SessionUser): Promise<void> {
  const token = await encryptSession(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_S,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { decryptSession };
