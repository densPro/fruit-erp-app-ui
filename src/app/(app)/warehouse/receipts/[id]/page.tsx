import type { Metadata } from "next";
import { ReceiptDetail } from "@/modules/warehouse/receiving";

export const metadata: Metadata = { title: "Receipt" };

export default async function Page({ params }: PageProps<"/warehouse/receipts/[id]">) {
  const { id } = await params;
  return <ReceiptDetail id={id} />;
}
