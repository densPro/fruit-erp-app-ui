import type { Metadata } from "next";
import { PickListsView } from "@/modules/warehouse/picking";

export const metadata: Metadata = { title: "Pick lists" };

export default function Page() {
  return <PickListsView />;
}
