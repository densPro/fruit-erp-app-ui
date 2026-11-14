import { pageTitle } from "@/lib/i18n/metadata";
import { PutawayView } from "@/modules/warehouse/putaway";

export const generateMetadata = pageTitle("putaway");

export default function Page() {
  return <PutawayView />;
}
