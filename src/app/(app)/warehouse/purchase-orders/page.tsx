import { pageTitle } from "@/lib/i18n/metadata";
import { PurchaseOrdersView } from "@/modules/warehouse/receiving";

export const generateMetadata = pageTitle("purchaseOrders");

export default function Page() {
  return <PurchaseOrdersView />;
}
