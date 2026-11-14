"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ErrorState, PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { formatDate, shortId } from "@/lib/utils";
import { ItemLabel } from "../../shared/lookups";
import { useReceipt } from "../hooks/use-receiving";

export function ReceiptDetail({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = useReceipt(id);
  return (
    <RequirePermission allowed={can("stock:view")}>
      <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/warehouse/receipts"><ArrowLeft /> Receipts</Link></Button>
      {q.isLoading && <Skeleton className="h-40" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {q.data && (
        <>
          <PageHeader title={`Receipt ${shortId(q.data.id)}`} description={`Received ${formatDate(q.data.created_at)}`} actions={q.data.has_discrepancy ? <Badge tone="warning">has discrepancies</Badge> : <Badge tone="success">matched</Badge>} />
          <Card>
            <CardContent className="grid gap-1 text-sm">
              <p>Purchase order: {q.data.purchase_order_id ? <span className="font-mono text-xs">{shortId(q.data.purchase_order_id)}</span> : "none recorded (unexpected delivery)"}</p>
              {q.data.notes && <p>Notes: {q.data.notes}</p>}
            </CardContent>
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>Item</TH><TH>Expected</TH><TH>Received</TH><TH>Flag</TH></TR></THead>
              <TBody>
                {q.data.lines.map((l) => (
                  <TR key={l.id}>
                    <TD><ItemLabel id={l.item_id} /></TD>
                    <TD className="tabular-nums">{l.expected_qty ?? "-"}</TD>
                    <TD className="tabular-nums font-semibold">{l.received_qty}</TD>
                    <TD>{l.discrepancy ? <StatusBadge status={l.discrepancy} /> : <Badge tone="success">ok</Badge>}</TD>
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
