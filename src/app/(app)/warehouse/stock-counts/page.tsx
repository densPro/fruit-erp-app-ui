import type { Metadata } from "next";
import { StockCountsView } from "@/modules/warehouse/stock-counts";

export const metadata: Metadata = { title: "Stock counts" };

export default function Page() {
  return <StockCountsView />;
}
