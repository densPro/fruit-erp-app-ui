import { pageTitle } from "@/lib/i18n/metadata";
import { ItemsView } from "@/modules/warehouse/catalog";

export const generateMetadata = pageTitle("items");

export default function Page() {
  return <ItemsView />;
}
