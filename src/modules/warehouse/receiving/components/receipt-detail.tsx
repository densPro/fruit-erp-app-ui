"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ErrorState, PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { shortId } from "@/lib/utils";
import { useFormatDate } from "@/lib/i18n/format";
import { ItemLabel } from "../../shared/lookups";
import { useReceipt } from "../hooks/use-receiving";

export function ReceiptDetail({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = useReceipt(id);
  const t = useTranslations("warehouse.receiving.detail");
  const tc = useTranslations("common");
  const ts = useTranslations("status");
  const formatDate = useFormatDate();
  return (
    <RequirePermission allowed={can("stock:view")}>
      <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/warehouse/receipts"><ArrowLeft /> {t("back")}</Link></Button>
      {q.isLoading && <Skeleton className="h-40" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {q.data && (
        <>
          <PageHeader title={t("title", { id: shortId(q.data.id) })} description={t("receivedAt", { date: formatDate(q.data.created_at) })} actions={q.data.has_discrepancy ? <Badge tone="warning">{ts("hasDiscrepancies")}</Badge> : <Badge tone="success">{ts("matched")}</Badge>} />
          <Card>
            <CardContent className="grid gap-1 text-sm">
              <p>{t("purchaseOrder")} {q.data.purchase_order_id ? <span className="font-mono text-xs">{shortId(q.data.purchase_order_id)}</span> : t("noPo")}</p>
              {q.data.notes && <p>{t("notes", { notes: q.data.notes })}</p>}
            </CardContent>
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>{tc("item")}</TH><TH>{t("expected")}</TH><TH>{t("received")}</TH><TH>{t("flag")}</TH></TR></THead>
              <TBody>
                {q.data.lines.map((l) => (
                  <TR key={l.id}>
                    <TD><ItemLabel id={l.item_id} /></TD>
                    <TD className="tabular-nums">{l.expected_qty ?? "-"}</TD>
                    <TD className="tabular-nums font-semibold">{l.received_qty}</TD>
                    <TD>{l.discrepancy ? <StatusBadge status={l.discrepancy} /> : <Badge tone="success">{ts("ok")}</Badge>}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </RequirePermission>
  );
}
