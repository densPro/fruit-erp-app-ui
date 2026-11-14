import type { Metadata } from "next";
import { ItemsView } from "@/modules/warehouse/catalog";

export const metadata: Metadata = { title: "Items" };

export default function Page() {
  return <ItemsView />;
}
