import { pageTitle } from "@/lib/i18n/metadata";
import { MovementsView } from "@/modules/warehouse/inventory";

export const generateMetadata = pageTitle("movements");

export default function Page() {
  return <MovementsView />;
}
