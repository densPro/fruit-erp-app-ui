import { describe, expect, it } from "vitest";
import { hasPermission } from "./use-me";

describe("hasPermission", () => {
  it("matches exact permissions", () => expect(hasPermission(["stock:view"], "stock:view")).toBe(true));
  it("denies missing permissions", () => expect(hasPermission(["stock:view"], "stock:adjust")).toBe(false));
  it("supports resource wildcards", () => expect(hasPermission(["stock:*"], "stock:transfer")).toBe(true));
  it("supports a global wildcard", () => expect(hasPermission(["*"], "anything:here")).toBe(true));
  it("denies when permissions are not loaded", () => expect(hasPermission(undefined, "stock:view")).toBe(false));
});
