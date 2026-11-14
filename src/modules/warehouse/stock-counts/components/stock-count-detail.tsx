"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Ban, CheckCheck, Plus, Save, Send } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ErrorState, PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, toastError } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { ItemLabel, LocationLabel, useItemLookup } from "../../shared/lookups";
import { useApproveCount, useCancelCount, useRecordLines, useStockCount, useSubmitCount } from "../hooks/use-stock-counts";
import { approveSchema, countedLinesSchema, type ApproveValues, type CountedLinesValues } from "../schemas";
import type { StockCount } from "../types";

function ApproveDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const approve = useApproveCount(id);
  const { register, handleSubmit, setError, formState } = useForm<ApproveValues>({ resolver: zodResolver(approveSchema), defaultValues: { reason: "" } });
  async function onSubmit(v: ApproveValues) {
    try {
      await approve.mutateAsync(v.reason);
      setOpen(false);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="cta"><CheckCheck /> Approve & adjust stock</Button></DialogTrigger>
      <DialogContent title="Approve count" description="This writes one adjustment per variance to the ledger, under your name. It cannot be undone.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="Reason" error={formState.errors.reason?.message}><Textarea rows={3} {...register("reason")} autoFocus /></Field>
          <Button type="submit" disabled={approve.isPending}>{approve.isPending ? "Approving…" : "Approve count"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CountEditor({ count }: { count: StockCount }) {
  const { items } = useItemLookup();
  const record = useRecordLines(count.id);
  const { register, control, handleSubmit, reset, formState } = useForm<CountedLinesValues, unknown, { lines: { item_id: string; counted_qty: number | "" }[] }>({
    resolver: zodResolver(countedLinesSchema),
    defaultValues: { lines: count.lines.map((l) => ({ item_id: l.item_id, counted_qty: l.counted_qty ?? "" })) },
  });
  const { fields, append } = useFieldArray({ control, name: "lines" });
  useEffect(() => {
    reset({ lines: count.lines.map((l) => ({ item_id: l.item_id, counted_qty: l.counted_qty ?? "" })) });
  }, [count, reset]);
  const [extra, setExtra] = useState("");

  async function onSubmit(v: { lines: { item_id: string; counted_qty: number | "" }[] }) {
    const lines = v.lines.filter((l) => l.counted_qty !== "").map((l) => ({ item_id: l.item_id, counted_qty: Number(l.counted_qty) }));
    if (!lines.length) return;
    try {
      await record.mutateAsync(lines);
    } catch (e) {
      toastError(e);
    }
  }
  const systemQty = (itemId: string) => count.lines.find((l) => l.item_id === itemId)?.system_qty ?? 0;
  const known = new Set(fields.map((f) => f.item_id));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <Table>
        <THead><TR className="hover:bg-transparent"><TH>Item</TH><TH>System</TH><TH>Counted</TH></TR></THead>
        <TBody>
          {fields.map((f, i) => (
            <TR key={f.id}>
              <TD><ItemLabel id={f.item_id} /></TD>
              <TD className="tabular-nums">{systemQty(f.item_id)}</TD>
              <TD className="w-40">
                <Input type="number" min={0} inputMode="numeric" aria-label={`Counted quantity for line ${i + 1}`} {...register(`lines.${i}.counted_qty`)} aria-invalid={!!formState.errors.lines?.[i]?.counted_qty} />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <div className="flex flex-wrap items-center gap-2 px-3">
        <Select className="w-64" value={extra} onChange={(e) => setExtra(e.target.value)} aria-label="Add item not in the baseline">
          <option value="">Add an item not in the baseline…</option>
          {items.filter((i) => !known.has(i.id)).map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
        </Select>
        <Button type="button" variant="outline" disabled={!extra} onClick={() => { append({ item_id: extra, counted_qty: "" }); setExtra(""); }}><Plus /> Add</Button>
        <div className="flex-1" />
        <Button type="submit" disabled={record.isPending}><Save /> {record.isPending ? "Saving…" : "Save counts"}</Button>
      </div>
    </form>
  );
}

export function StockCountDetail({ id }: { id: string }) {
  const { can } = usePermissions();
  const q = useStockCount(id);
  const submit = useSubmitCount(id);
  const cancel = useCancelCount(id);
  const c = q.data;

  return (
    <RequirePermission allowed={can("stock:view")}>
      <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/warehouse/stock-counts"><ArrowLeft /> Stock counts</Link></Button>
      {q.isLoading && <Skeleton className="h-40" />}
      {q.error && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
      {c && (
        <>
          <PageHeader
            title="Stock count"
            description={`Opened ${formatDate(c.created_at)}`}
            actions={<>
              <StatusBadge status={c.status} />
              {c.status === "open" && can("stock:transfer") && (
                <Button variant="outline" disabled={submit.isPending} onClick={() => submit.mutate(undefined, { onError: toastError })}><Send /> Submit for approval</Button>
              )}
              {c.status === "submitted" && can("stock:adjust") && <ApproveDialog id={c.id} />}
              {(c.status === "open" || c.status === "submitted") && can("stock:transfer") && (
                <Button variant="danger" size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate(undefined, { onError: toastError })}><Ban /> Cancel</Button>
              )}
            </>}
          />
          <Card>
            <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>Bin: <LocationLabel id={c.location_id} /></span>
              {c.approved_at && <span>Approved {formatDate(c.approved_at)}</span>}
              {c.approval_reason && <span>Reason: {c.approval_reason}</span>}
            </CardContent>
            {c.status === "open" && can("stock:transfer") ? (
              <CountEditor count={c} />
            ) : (
              <Table>
                <THead><TR className="hover:bg-transparent"><TH>Item</TH><TH>System</TH><TH>Counted</TH><TH>Variance</TH></TR></THead>
                <TBody>
                  {c.lines.map((l) => (
                    <TR key={l.id}>
                      <TD><ItemLabel id={l.item_id} /></TD>
                      <TD className="tabular-nums">{l.system_qty}</TD>
                      <TD className="tabular-nums">{l.counted_qty ?? "-"}</TD>
                      <TD>{l.variance ? <Badge tone={l.variance < 0 ? "danger" : "warning"}>{l.variance > 0 ? `+${l.variance}` : l.variance}</Badge> : <span className="text-muted-foreground">{l.counted_qty === null ? "-" : "0"}</span>}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </RequirePermission>
  );
}
