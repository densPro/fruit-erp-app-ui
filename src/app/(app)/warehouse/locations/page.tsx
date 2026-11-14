import type { Metadata } from "next";
import { LocationsView } from "@/modules/warehouse/catalog";

export const metadata: Metadata = { title: "Locations" };

export default function Page() {
  return <LocationsView />;
}
