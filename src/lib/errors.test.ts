import { describe, expect, it, vi } from "vitest";
import { createTranslator } from "next-intl";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { ApiError } from "./api";
import { applyFieldErrors, errorMessage } from "./errors";

const tEn = createTranslator({ locale: "en", messages: en, namespace: "errors" });
const tEs = createTranslator({ locale: "es", messages: es, namespace: "errors" });

describe("errors", () => {
  it("explains 403 in plain words", () => expect(errorMessage(new ApiError(403, { code: "forbidden" }), tEn, "en")).toMatch(/permission/));
  it("keeps the backend detail in English", () =>
    expect(errorMessage(new ApiError(409, { code: "insufficient_stock", detail: "Only 3 left in A-01" }), tEn, "en")).toBe("Only 3 left in A-01"));
  it("translates by code in Spanish", () =>
    expect(errorMessage(new ApiError(409, { code: "insufficient_stock", detail: "Only 3 left in A-01" }), tEs, "es")).toBe(es.errors.insufficient_stock));
  it("falls back to the HTTP status for unknown codes", () =>
    expect(errorMessage(new ApiError(503, { code: "weird" }), tEs, "es")).toBe(es.errors.service_unavailable));
  it("falls back to the backend detail when nothing maps", () =>
    expect(errorMessage(new ApiError(418, { detail: "teapot" }), tEs, "es")).toBe("teapot"));
  it("hides raw JS errors outside English", () => expect(errorMessage(new Error("Failed to fetch"), tEs, "es")).toBe(es.errors.generic));
  it("maps 422 field errors onto form fields", () => {
    const setError = vi.fn();
    const err = new ApiError(422, { code: "validation_error", errors: [{ loc: ["body", "sku"], msg: "too short" }] });
    expect(applyFieldErrors(err, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("sku", { message: "too short" });
  });
  it("returns false when there is nothing to map", () => expect(applyFieldErrors(new Error("x"), vi.fn())).toBe(false));
});
