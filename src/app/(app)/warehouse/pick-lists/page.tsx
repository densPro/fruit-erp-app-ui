import { pageTitle } from "@/lib/i18n/metadata";
import { PickListsView } from "@/modules/warehouse/picking";

export const generateMetadata = pageTitle("pickLists");

export default function Page() {
  return <PickListsView />;
}
