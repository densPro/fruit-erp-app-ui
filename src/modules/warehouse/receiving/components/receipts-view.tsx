"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { shortId } from "@/lib/utils";
import { useFormatDate } from "@/lib/i18n/format";
import { useReceipts } from "../hooks/use-receiving";
import type { GoodsReceipt } from "../types";

export function ReceiptsView() {
  const { can } = usePermissions();
  const router = useRouter();
  const t = useTranslations("warehouse.receiving.receipts");
  const tc = useTranslations("common");
  const ts = useTranslations("status");
  const formatDate = useFormatDate();
  const [disc, setDisc] = useState("");
  const [offset, setOffset] = useState(0);
  const q = useReceipts({ has_discrepancy: disc === "" ? undefined : disc === "true", offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader
        title={t("title")} description={t("description")}
        actions={can("stock:transfer") ? <Button asChild><Link href="/warehouse/receipts/new"><Plus /> {t("receiveGoods")}</Link></Button> : undefined}
      />
      <Card>
        <div className="border-b p-3">
          <Select className="w-56" value={disc} onChange={(e) => { setDisc(e.target.value); setOffset(0); }} aria-label={t("discrepancyFilter")}>
            <option value="">{t("allReceipts")}</option><option value="true">{t("withDiscrepancies")}</option><option value="false">{t("matched")}</option>
          </Select>
        </div>
        <DataTable<GoodsReceipt>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle={t("empty")} onRowClick={(r) => router.push(`/warehouse/receipts/${r.id}`)}
          columns={[
            { header: t("receipt"), accessorKey: "id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
            { header: t("purchaseOrder"), accessorKey: "purchase_order_id", cell: (c) => (c.getValue() ? <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> : <Badge tone="warning">{ts("noPo")}</Badge>) },
            { header: tc("lines"), id: "lines", cell: (c) => c.row.original.lines.length },
            { header: t("result"), accessorKey: "has_discrepancy", cell: (c) => c.getValue() ? <Badge tone="warning"><AlertTriangle className="mr-1 size-3" />{ts("discrepancy")}</Badge> : <Badge tone="success">{ts("matched")}</Badge> },
            { header: t("received"), accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
