import { pageTitle } from "@/lib/i18n/metadata";
import { PickListDetail } from "@/modules/warehouse/picking";

export const generateMetadata = pageTitle("pickList");

export default async function Page({ params }: PageProps<"/warehouse/pick-lists/[id]">) {
  const { id } = await params;
  return <PickListDetail id={id} />;
}
