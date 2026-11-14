"use client";
import Link from "next/link";
import { ArrowLeft, Check, Ban } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ErrorState, PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { ApiError } from "@/lib/api";
import { toastError } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ItemLabel, LocationLabel } from "../../shared/lookups";
import { useCancelPickList, useConfirmPick, usePickList } from "../hooks/use-picking";

export function PickListDetail({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = usePickList(id);
  const confirm = useConfirmPick(id);
  const cancel = useCancelPickList(id);
  const active = q.data && (q.data.status === "open" || q.data.status === "in_progress");

  function onConfirm(lineId: string) {
    confirm.mutate({ lineId }, {
      onError: (e) => {
        if (e instanceof ApiError && e.code === "insufficient_stock") toast.error("Not enough stock in that bin", { description: e.message });
        else toastError(e);
      },
    });
  }

  return (
    <RequirePermission allowed={can("stock:view")}>
      <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/warehouse/pick-lists"><ArrowLeft /> Pick lists</Link></Button>
      {q.isLoading && <Skeleton className="h-40" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {q.data && (
        <>
          <PageHeader
            title={q.data.reference || `Pick list ${q.data.id.slice(0, 8)}`}
            description={`Created ${formatDate(q.data.created_at)}`}
            actions={<>
              <StatusBadge status={q.data.status} />
              {active && can("stock:transfer") && (
                <Button variant="danger" size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate(undefined, { onError: toastError })}><Ban /> Cancel list</Button>
              )}
            </>}
          />
          <Card>
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>Item</TH><TH>Bin</TH><TH>To pick</TH><TH>Picked</TH><TH /></TR></THead>
              <TBody>
                {q.data.lines.map((l) => {
                  const done = l.picked_qty >= l.quantity;
                  return (
                    <TR key={l.id}>
                      <TD><ItemLabel id={l.item_id} /></TD>
                      <TD><LocationLabel id={l.location_id} /></TD>
                      <TD className="tabular-nums">{l.quantity}</TD>
                      <TD className="tabular-nums font-semibold">{l.picked_qty}</TD>
                      <TD className="text-right">
                        {done ? <StatusBadge status="picked" /> : active && can("stock:transfer") ? (
                          <Button size="sm" disabled={confirm.isPending} onClick={() => onConfirm(l.id)}><Check /> Confirm pick</Button>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </RequirePermission>
  );
}
