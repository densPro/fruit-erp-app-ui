"use client";
import { useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { useFormatDate } from "@/lib/i18n/format";
import { usePurchaseOrders } from "../hooks/use-receiving";
import { NewPurchaseOrderDialog } from "./po-form-dialog";
import type { PurchaseOrder } from "../types";

export function PurchaseOrdersView() {
  const { can } = usePermissions();
  const t = useTranslations("warehouse.receiving.purchaseOrders");
  const tc = useTranslations("common");
  const formatDate = useFormatDate();
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const q = usePurchaseOrders({ status: status || undefined, offset });

  return (
    <RequirePermission allowed={can("purchase:view")}>
      <PageHeader title={t("title")} description={t("description")} actions={can("purchase:create") ? <NewPurchaseOrderDialog /> : undefined} />
      <Card>
        <div className="border-b p-3">
          <Select className="w-52" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label={tc("status")}>
            <option value="">{tc("allStatuses")}</option><option value="open">{t("statusOpen")}</option><option value="partially_received">{t("statusPartial")}</option><option value="received">{t("statusReceived")}</option>
          </Select>
        </div>
        <DataTable<PurchaseOrder>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle={t("empty")}
          columns={[
            { header: t("poNumber"), accessorKey: "po_number", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: t("supplier"), accessorKey: "supplier" },
            { header: tc("status"), accessorKey: "status", cell: (c) => <StatusBadge status={c.getValue() as string} /> },
            { header: tc("lines"), id: "lines", cell: (c) => c.row.original.lines.length },
            { header: t("receivedOrdered"), id: "progress", cell: (c) => {
                const l = c.row.original.lines;
                return <span className="tabular-nums">{l.reduce((s, x) => s + x.received_qty, 0)} / {l.reduce((s, x) => s + x.ordered_qty, 0)}</span>;
              } },
            { header: tc("created"), accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            ...(can("stock:transfer") ? [{ header: "", id: "recv", cell: (c: { row: { original: PurchaseOrder } }) =>
                c.row.original.status !== "received" ? (
                  <Button asChild size="sm" variant="outline"><Link href={`/warehouse/receipts/new?po=${c.row.original.id}`}><Truck /> {t("receive")}</Link></Button>
                ) : null }] : []),
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
