import { pageTitle } from "@/lib/i18n/metadata";
import { Suspense } from "react";
import { ReceiptForm } from "@/modules/warehouse/receiving";

export const generateMetadata = pageTitle("receiveGoods");

export default function Page() {
  return (
    <Suspense>
      <ReceiptForm />
    </Suspense>
  );
}
