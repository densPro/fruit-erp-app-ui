import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { HtmlLang } from "./html-lang";

/** Reads the locale cookie (request-time data), so it must render inside <Suspense>. */
export async function IntlRoot({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
