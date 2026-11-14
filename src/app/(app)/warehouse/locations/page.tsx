import { pageTitle } from "@/lib/i18n/metadata";
import { LocationsView } from "@/modules/warehouse/catalog";

export const generateMetadata = pageTitle("locations");

export default function Page() {
  return <LocationsView />;
}
