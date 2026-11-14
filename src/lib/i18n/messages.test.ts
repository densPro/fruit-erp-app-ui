import { describe, expect, it } from "vitest";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { negotiateLocale } from "./config";

type Tree = { [k: string]: string | Tree };
function flatten(o: Tree, prefix = ""): Record<string, string> {
  return Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "string" ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) };
  }, {});
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort();

describe("message catalogs", () => {
  const fe = flatten(en), fs = flatten(es);
  it("en and es have the same keys", () => expect(Object.keys(fs).sort()).toEqual(Object.keys(fe).sort()));
  it("no message is empty", () => [...Object.values(fe), ...Object.values(fs)].forEach((v) => expect(v.trim()).not.toBe("")));
  it("placeholders match between languages", () => Object.keys(fe).forEach((k) => expect([k, placeholders(fs[k] ?? "")]).toEqual([k, placeholders(fe[k])])));
});

describe("negotiateLocale", () => {
  it("defaults to English", () => expect(negotiateLocale(null)).toBe("en"));
  it("picks Spanish from a regional tag", () => expect(negotiateLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es"));
  it("respects quality values", () => expect(negotiateLocale("fr;q=1, en;q=0.5, es;q=0.7")).toBe("es"));
  it("ignores unsupported languages", () => expect(negotiateLocale("de-DE")).toBe("en"));
});
