import { pageTitle } from "@/lib/i18n/metadata";
import { StockLevelsView } from "@/modules/warehouse/inventory";

export const generateMetadata = pageTitle("stockLevels");

export default function Page() {
  return <StockLevelsView />;
}
