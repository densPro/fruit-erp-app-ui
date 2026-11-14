import type { Metadata } from "next";
import { StockCountDetail } from "@/modules/warehouse/stock-counts";

export const metadata: Metadata = { title: "Stock count" };

export default async function Page({ params }: PageProps<"/warehouse/stock-counts/[id]">) {
  const { id } = await params;
  return <StockCountDetail id={id} />;
}
