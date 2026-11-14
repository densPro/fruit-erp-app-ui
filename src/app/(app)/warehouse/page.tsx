import { pageTitle } from "@/lib/i18n/metadata";
import { WarehouseDashboard } from "@/modules/warehouse/dashboard";

export const generateMetadata = pageTitle("warehouse");

export default function Page() {
  return <WarehouseDashboard />;
}
