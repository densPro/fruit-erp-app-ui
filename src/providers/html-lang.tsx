"use client";
import { useEffect } from "react";

/** Keeps <html lang> in sync with the UI language; the root <html> stays static for prerendering. */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
