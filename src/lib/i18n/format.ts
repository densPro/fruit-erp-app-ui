"use client";
import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";

/** Date formatter bound to the active UI language. */
export function useFormatDate() {
  const locale = useLocale();
  return useCallback((iso: string | null | undefined) => formatDate(iso, locale), [locale]);
}

/**
 * Translates a message that may be a key (Zod schemas carry keys like "validation.required")
 * and returns plain text unchanged (e.g. server 422 messages).
 */
export function useMessageText() {
  const t = useTranslations();
  return useCallback(
    (msg: string | undefined) => (msg && t.has(msg as Parameters<typeof t.has>[0]) ? t(msg as Parameters<typeof t>[0]) : msg),
    [t],
  );
}
