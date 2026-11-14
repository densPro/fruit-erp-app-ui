import { pageTitle } from "@/lib/i18n/metadata";
import { ReceiptsView } from "@/modules/warehouse/receiving";

export const generateMetadata = pageTitle("receipts");

export default function Page() {
  return <ReceiptsView />;
}
