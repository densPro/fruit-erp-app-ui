import type { Metadata } from "next";
import { PickListDetail } from "@/modules/warehouse/picking";

export const metadata: Metadata = { title: "Pick list" };

export default async function Page({ params }: PageProps<"/warehouse/pick-lists/[id]">) {
  const { id } = await params;
  return <PickListDetail id={id} />;
}
