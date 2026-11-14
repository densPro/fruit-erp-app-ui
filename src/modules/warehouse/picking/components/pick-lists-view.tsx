"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, toastError } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useCreatePickList, usePickLists } from "../hooks/use-picking";
import { pickListSchema, type PickListPayload, type PickListValues } from "../schemas";
import type { PickList } from "../types";

function NewPickListDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { items } = useItemLookup();
  const { locations } = useLocationLookup();
  const create = useCreatePickList();
  const { register, control, handleSubmit, setError, reset, formState } = useForm<PickListValues, unknown, PickListPayload>({
    resolver: zodResolver(pickListSchema),
    defaultValues: { reference: "", lines: [{ item_id: "", location_id: "", quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  async function onSubmit(v: PickListPayload) {
    try {
      const pl = await create.mutateAsync(v);
      reset();
      setOpen(false);
      router.push(`/warehouse/pick-lists/${pl.id}`);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus /> New pick list</Button></DialogTrigger>
      <DialogContent title="New pick list" description="Say what to take and from which bin." className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="Reference (e.g. order number)"><Input {...register("reference")} autoFocus /></Field>
          <div className="grid gap-2">
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_8rem_5rem_auto] items-start gap-2">
                <Field label="Item" error={formState.errors.lines?.[i]?.item_id?.message}>
                  <Select {...register(`lines.${i}.item_id`)}>
                    <option value="">Item…</option>
                    {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                  </Select>
                </Field>
                <Field label="Bin" error={formState.errors.lines?.[i]?.location_id?.message}>
                  <Select {...register(`lines.${i}.location_id`)}>
                    <option value="">Bin…</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
                  </Select>
                </Field>
                <Field label="Qty" error={formState.errors.lines?.[i]?.quantity?.message}>
                  <Input type="number" min={1} inputMode="numeric" {...register(`lines.${i}.quantity`)} />
                </Field>
                <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => remove(i)} disabled={fields.length === 1} aria-label="Remove line"><Trash2 /></Button>
              </div>
            ))}
            {formState.errors.lines?.message && <p className="text-xs text-danger">{formState.errors.lines.message}</p>}
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => append({ item_id: "", location_id: "", quantity: 1 })}><Plus /> Add line</Button>
          </div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create pick list"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PickListsView() {
  const { can } = usePermissions();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");
  const [offset, setOffset] = useState(0);
  const q = usePickLists({ status: status || undefined, reference: reference || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Pick lists" description="Instructions to take stock from bins." actions={can("stock:transfer") ? <NewPickListDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Input className="max-w-xs" placeholder="Search reference" value={reference} onChange={(e) => { setReference(e.target.value); setOffset(0); }} aria-label="Reference" />
          <Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <DataTable<PickList>
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No pick lists" onRowClick={(r) => router.push(`/warehouse/pick-lists/${r.id}`)}
          columns={[
            { header: "Reference", accessorKey: "reference", cell: (c) => <Link className="font-medium underline-offset-2 hover:underline" href={`/warehouse/pick-lists/${c.row.original.id}`}>{(c.getValue() as string) || c.row.original.id.slice(0, 8)}</Link> },
            { header: "Status", accessorKey: "status", cell: (c) => <StatusBadge status={c.getValue() as string} /> },
            { header: "Progress", id: "progress", cell: (c) => { const l = c.row.original.lines; return <span className="tabular-nums">{l.reduce((s, x) => s + x.picked_qty, 0)} / {l.reduce((s, x) => s + x.quantity, 0)}</span>; } },
            { header: "Created", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
