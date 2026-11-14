import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "You don't have permission to do this.";
    if (err.status === 503) return "The service is unavailable. Please retry in a moment.";
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export function toastError(err: unknown) {
  const id = err instanceof ApiError ? err.requestId : null;
  toast.error(errorMessage(err), id ? { description: `Error ID: ${id}` } : undefined);
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
