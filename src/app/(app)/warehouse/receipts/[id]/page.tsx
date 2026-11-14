import { pageTitle } from "@/lib/i18n/metadata";
import { ReceiptDetail } from "@/modules/warehouse/receiving";

export const generateMetadata = pageTitle("receipt");

export default async function Page({ params }: PageProps<"/warehouse/receipts/[id]">) {
  const { id } = await params;
  return <ReceiptDetail id={id} />;
}
