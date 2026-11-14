import { pageTitle } from "@/lib/i18n/metadata";
import { StockCountsView } from "@/modules/warehouse/stock-counts";

export const generateMetadata = pageTitle("stockCounts");

export default function Page() {
  return <StockCountsView />;
}
