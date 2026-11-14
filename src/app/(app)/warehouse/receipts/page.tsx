import type { Metadata } from "next";
import { ReceiptsView } from "@/modules/warehouse/receiving";

export const metadata: Metadata = { title: "Goods receipts" };

export default function Page() {
  return <ReceiptsView />;
}
