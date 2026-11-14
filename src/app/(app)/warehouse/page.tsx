import type { Metadata } from "next";
import { WarehouseDashboard } from "@/modules/warehouse/dashboard";

export const metadata: Metadata = { title: "Warehouse" };

export default function Page() {
  return <WarehouseDashboard />;
}
