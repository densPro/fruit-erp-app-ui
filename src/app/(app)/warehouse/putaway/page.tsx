import type { Metadata } from "next";
import { PutawayView } from "@/modules/warehouse/putaway";

export const metadata: Metadata = { title: "Put-away" };

export default function Page() {
  return <PutawayView />;
}
