"use server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";

/** Persist the chosen UI language. The caller refreshes the router afterwards. */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
