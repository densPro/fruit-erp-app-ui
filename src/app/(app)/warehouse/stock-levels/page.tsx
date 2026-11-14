import type { Metadata } from "next";
import { StockLevelsView } from "@/modules/warehouse/inventory";

export const metadata: Metadata = { title: "Stock levels" };

export default function Page() {
  return <StockLevelsView />;
}
