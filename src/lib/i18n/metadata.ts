import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Messages } from "next-intl";

type MetaKey = Exclude<keyof Messages["meta"], "appName" | "description">;

/** `export const generateMetadata = pageTitle("items")` gives a translated <title>. */
export function pageTitle(key: MetaKey) {
  return async (): Promise<Metadata> => ({ title: (await getTranslations("meta"))(key) });
}
