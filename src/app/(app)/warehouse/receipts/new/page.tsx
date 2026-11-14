import type { Metadata } from "next";
import { Suspense } from "react";
import { ReceiptForm } from "@/modules/warehouse/receiving";

export const metadata: Metadata = { title: "Receive goods" };

export default function Page() {
  return (
    <Suspense>
      <ReceiptForm />
    </Suspense>
  );
}
