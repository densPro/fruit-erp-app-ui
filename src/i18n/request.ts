import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, isLocale, negotiateLocale } from "@/lib/i18n/config";

/** Locale comes from the `erp_locale` cookie, else the browser's Accept-Language. No URL prefix. */
export default getRequestConfig(async () => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : negotiateLocale((await headers()).get("accept-language"));
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
