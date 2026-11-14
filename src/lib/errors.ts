"use client";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { ApiError } from "@/lib/api";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ErrorsT = ReturnType<typeof useTranslations<"errors">>;
type ErrorKey = Parameters<ErrorsT>[0];

const BACKEND_LOCALE = "en";
const STATUS_KEY: Record<number, ErrorKey> = {
  401: "unauthorized", 403: "forbidden", 404: "not_found", 409: "conflict", 422: "validation_error", 500: "internal_error", 503: "service_unavailable",
};
// These read better as a fixed sentence than as the backend's wording, in every language.
const ALWAYS_TRANSLATED = new Set<ErrorKey>(["forbidden", "service_unavailable"]);

/**
 * User-facing text for an error. Backends answer in English, so in English their `detail` is shown
 * (it is the most specific). In other languages the shared `code` is translated, falling back to
 * the HTTP status and finally to the backend's `detail`.
 */
export function errorMessage(err: unknown, t: ErrorsT, locale: string): string {
  if (err instanceof ApiError) {
    const code = err.code && t.has(err.code as ErrorKey) ? (err.code as ErrorKey) : STATUS_KEY[err.status];
    const detail = err.body.detail;
    if (code && (ALWAYS_TRANSLATED.has(code) || locale !== BACKEND_LOCALE || !detail)) return t(code);
    return detail ?? t("generic");
  }
  if (locale === BACKEND_LOCALE && err instanceof Error && err.message) return err.message;
  return t("generic");
}

/** Error helpers bound to the active language: `const { toastError } = useErrors()`. */
export function useErrors() {
  const t = useTranslations("errors");
  const ts = useTranslations("states");
  const locale = useLocale();
  const message = useCallback((err: unknown) => errorMessage(err, t, locale), [t, locale]);
  const toastError = useCallback(
    (err: unknown) => {
      const id = err instanceof ApiError ? err.requestId : null;
      toast.error(message(err), id ? { description: ts("errorId", { id }) } : undefined);
    },
    [message, ts],
  );
  return useMemo(() => ({ errorMessage: message, toastError }), [message, toastError]);
}

/** Map a 422 `errors` list onto react-hook-form fields. Returns true if anything was mapped. */
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  if (!(err instanceof ApiError) || !err.body.errors?.length) return false;
  let mapped = false;
  for (const e of err.body.errors) {
    const name = e.loc?.filter((p) => p !== "body").join(".");
    if (name) {
      setError(name as Path<T>, { message: e.msg });
      mapped = true;
    }
  }
  return mapped;
}
