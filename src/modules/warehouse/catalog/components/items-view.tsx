"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { applyFieldErrors, useErrors } from "@/lib/errors";
import { useFormatDate } from "@/lib/i18n/format";
import { useCreateItem, useItems, useUpdateItem } from "../hooks/use-catalog";
import { itemSchema, type ItemValues } from "../schemas";

function NewItemDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateItem();
  const t = useTranslations("warehouse.catalog.items");
  const tc = useTranslations("common");
  const { toastError } = useErrors();
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
        <Button><Plus /> {t("new")}</Button>
      </DialogTrigger>
      <DialogContent title={t("new")} description={t("dialogDescription")}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label={t("sku")} error={formState.errors.sku?.message}><Input {...register("sku")} autoFocus /></Field>
          <Field label={t("name")} error={formState.errors.name?.message}><Input {...register("name")} /></Field>
          <Field label={t("unit")} error={formState.errors.unit?.message} hint={t("unitHint")}><Input {...register("unit")} /></Field>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? tc("saving") : t("create")}</Button>
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
  const t = useTranslations("warehouse.catalog.items");
  const tc = useTranslations("common");
  const ts = useTranslations("status");
  const formatDate = useFormatDate();

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title={t("title")} description={t("description")} actions={can("product:create") ? <NewItemDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Input className="max-w-xs" placeholder={t("searchPlaceholder")} value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} aria-label={t("searchLabel")} />
          <Select className="w-40" value={active} onChange={(e) => { setActive(e.target.value); setOffset(0); }} aria-label={tc("status")}>
            <option value="">{tc("all")}</option><option value="true">{tc("active")}</option><option value="false">{tc("inactive")}</option>
          </Select>
        </div>
        <DataTable
          data={items.data} isLoading={items.isLoading} error={items.error} onRetry={() => items.refetch()}
          offset={offset} onOffsetChange={setOffset} emptyTitle={t("empty")}
          columns={[
            { header: t("sku"), accessorKey: "sku", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: t("name"), accessorKey: "name" },
            { header: t("unit"), accessorKey: "unit" },
            { header: tc("status"), accessorKey: "is_active", cell: (c) => <Badge tone={c.getValue() ? "success" : "neutral"}>{c.getValue() ? ts("active") : ts("inactive")}</Badge> },
            { header: tc("created"), accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            ...(can("product:edit")
              ? [{ header: "", id: "actions", cell: (c: { row: { original: { id: string; is_active: boolean } } }) => (
                  <Button variant="outline" size="sm" disabled={update.isPending} onClick={() => update.mutate({ id: c.row.original.id, is_active: !c.row.original.is_active })}>
                    {c.row.original.is_active ? tc("deactivate") : tc("activate")}
                  </Button>
                ) }]
              : []),
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
