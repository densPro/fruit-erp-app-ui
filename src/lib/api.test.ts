import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, serviceClient } from "./api";

afterEach(() => vi.restoreAllMocks());

describe("serviceClient", () => {
  it("builds the proxied URL and drops empty query params", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }));
    await serviceClient("warehouse").get("/items", { q: "lime", active: undefined, zone: "", offset: 0 });
    expect(f.mock.calls[0][0]).toBe("/api/warehouse/items?q=lime&offset=0");
  });

  it("throws ApiError with the backend error body", async () => {
    const body = { detail: "Not enough stock", code: "insufficient_stock", request_id: "r1" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: 409 }));
    const err = (await serviceClient("warehouse").post("/putaways", {}).catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe("insufficient_stock");
    expect(err.requestId).toBe("r1");
  });
});
