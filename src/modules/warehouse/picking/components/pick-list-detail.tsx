"use client";
import Link from "next/link";
import { ArrowLeft, Check, Ban } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ErrorState, PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { ApiError } from "@/lib/api";
import { useErrors } from "@/lib/errors";
import { useFormatDate } from "@/lib/i18n/format";
import { toast } from "sonner";
import { ItemLabel, LocationLabel } from "../../shared/lookups";
import { useCancelPickList, useConfirmPick, usePickList } from "../hooks/use-picking";

export function PickListDetail({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = usePickList(id);
  const confirm = useConfirmPick(id);
  const cancel = useCancelPickList(id);
  const t = useTranslations("warehouse.picking");
  const tc = useTranslations("common");
  const { errorMessage, toastError } = useErrors();
  const formatDate = useFormatDate();
  const active = q.data && (q.data.status === "open" || q.data.status === "in_progress");

  function onConfirm(lineId: string) {
    confirm.mutate({ lineId }, {
      onError: (e) => {
        if (e instanceof ApiError && e.code === "insufficient_stock") toast.error(t("insufficientStock"), { description: errorMessage(e) });
        else toastError(e);
      },
    });
  }

  return (
    <RequirePermission allowed={can("stock:view")}>
      <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/warehouse/pick-lists"><ArrowLeft /> {t("back")}</Link></Button>
      {q.isLoading && <Skeleton className="h-40" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {q.data && (
        <>
          <PageHeader
            title={q.data.reference || t("untitled", { id: q.data.id.slice(0, 8) })}
            description={t("createdAt", { date: formatDate(q.data.created_at) })}
            actions={<>
              <StatusBadge status={q.data.status} />
              {active && can("stock:transfer") && (
                <Button variant="danger" size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate(undefined, { onError: toastError })}><Ban /> {t("cancelList")}</Button>
              )}
            </>}
          />
          <Card>
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>{tc("item")}</TH><TH>{tc("bin")}</TH><TH>{t("toPick")}</TH><TH>{t("picked")}</TH><TH /></TR></THead>
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
                          <Button size="sm" disabled={confirm.isPending} onClick={() => onConfirm(l.id)}><Check /> {t("confirmPick")}</Button>
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
