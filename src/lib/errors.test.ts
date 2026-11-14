import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./api";
import { applyFieldErrors, errorMessage } from "./errors";

describe("errors", () => {
  it("explains 403 in plain words", () => expect(errorMessage(new ApiError(403, { code: "forbidden" }))).toMatch(/permission/));
  it("maps 422 field errors onto form fields", () => {
    const setError = vi.fn();
    const err = new ApiError(422, { code: "validation_error", errors: [{ loc: ["body", "sku"], msg: "too short" }] });
    expect(applyFieldErrors(err, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("sku", { message: "too short" });
  });
  it("returns false when there is nothing to map", () => expect(applyFieldErrors(new Error("x"), vi.fn())).toBe(false));
});
