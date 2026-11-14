import type { Metadata } from "next";
import { PurchaseOrdersView } from "@/modules/warehouse/receiving";

export const metadata: Metadata = { title: "Purchase orders" };

export default function Page() {
  return <PurchaseOrdersView />;
}
