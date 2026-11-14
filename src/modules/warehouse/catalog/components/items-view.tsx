"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, toastError } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { useCreateItem, useItems, useUpdateItem } from "../hooks/use-catalog";
import { itemSchema, type ItemValues } from "../schemas";

function NewItemDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateItem();
  const { register, handleSubmit, setError, reset, formState } = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { sku: "", name: "", unit: "case" },
  });
  async function onSubmit(v: ItemValues) {
    try {
      await create.mutateAsync(v);
      reset();
      setOpen(false);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) toastError(e);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus /> New item</Button>
      </DialogTrigger>
      <DialogContent title="New item" description="Items are the fruit products you stock.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="SKU" error={formState.errors.sku?.message}><Input {...register("sku")} autoFocus /></Field>
          <Field label="Name" error={formState.errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="Unit" error={formState.errors.unit?.message} hint="e.g. case, box, crate"><Input {...register("unit")} /></Field>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create item"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ItemsView() {
  const { can } = usePermissions();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const [offset, setOffset] = useState(0);
  const items = useItems({ q: q || undefined, active: active === "" ? undefined : active === "true", offset });
  const update = useUpdateItem();

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Items" description="Fruit products in the catalog." actions={can("product:create") ? <NewItemDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Input className="max-w-xs" placeholder="Search SKU or name" value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} aria-label="Search items" />
          <Select className="w-40" value={active} onChange={(e) => { setActive(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="">All</option><option value="true">Active</option><option value="false">Inactive</option>
          </Select>
        </div>
        <DataTable
          data={items.data} isLoading={items.isLoading} error={items.error} onRetry={() => items.refetch()}
          offset={offset} onOffsetChange={setOffset} emptyTitle="No items found"
          columns={[
            { header: "SKU", accessorKey: "sku", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: "Name", accessorKey: "name" },
            { header: "Unit", accessorKey: "unit" },
            { header: "Status", accessorKey: "is_active", cell: (c) => <Badge tone={c.getValue() ? "success" : "neutral"}>{c.getValue() ? "active" : "inactive"}</Badge> },
            { header: "Created", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            ...(can("product:edit")
              ? [{ header: "", id: "actions", cell: (c: { row: { original: { id: string; is_active: boolean } } }) => (
                  <Button variant="outline" size="sm" disabled={update.isPending} onClick={() => update.mutate({ id: c.row.original.id, is_active: !c.row.original.is_active })}>
                    {c.row.original.is_active ? "Deactivate" : "Activate"}
                  </Button>
                ) }]
              : []),
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
