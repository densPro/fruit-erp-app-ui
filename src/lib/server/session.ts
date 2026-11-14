import "server-only";
import { cookies } from "next/headers";

export const ACCESS_COOKIE = "erp_access";
export const REFRESH_COOKIE = "erp_refresh";

export type Tokens = { access_token: string; refresh_token: string; expires_in: number };

const base = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function readTokens() {
  const jar = await cookies();
  return { access: jar.get(ACCESS_COOKIE)?.value, refresh: jar.get(REFRESH_COOKIE)?.value };
}

export async function writeTokens(t: Tokens) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, t.access_token, { ...base, maxAge: Math.max(t.expires_in, 60) });
  jar.set(REFRESH_COOKIE, t.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 14 });
}

export async function clearTokens() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}
