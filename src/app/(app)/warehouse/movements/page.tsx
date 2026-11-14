import type { Metadata } from "next";
import { MovementsView } from "@/modules/warehouse/inventory";

export const metadata: Metadata = { title: "Movement ledger" };

export default function Page() {
  return <MovementsView />;
}
