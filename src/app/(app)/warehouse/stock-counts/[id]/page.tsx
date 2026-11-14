import { pageTitle } from "@/lib/i18n/metadata";
import { StockCountDetail } from "@/modules/warehouse/stock-counts";

export const generateMetadata = pageTitle("stockCount");

export default async function Page({ params }: PageProps<"/warehouse/stock-counts/[id]">) {
  const { id } = await params;
  return <StockCountDetail id={id} />;
}
