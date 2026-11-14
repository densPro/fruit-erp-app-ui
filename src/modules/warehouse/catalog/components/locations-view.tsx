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
import { useCreateLocation, useLocations, useUpdateLocation } from "../hooks/use-catalog";
import { locationSchema, type LocationValues } from "../schemas";

function NewLocationDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateLocation();
  const t = useTranslations("warehouse.catalog.locations");
  const tc = useTranslations("common");
  const { toastError } = useErrors();
  const { register, handleSubmit, setError, reset, formState } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { code: "", zone: "", kind: "storage" },
  });
  async function onSubmit(v: LocationValues) {
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
          <Field label={t("code")} error={formState.errors.code?.message}><Input {...register("code")} autoFocus /></Field>
          <Field label={t("zone")} error={formState.errors.zone?.message}><Input {...register("zone")} /></Field>
          <Field label={t("kind")} error={formState.errors.kind?.message} hint={t("kindHint")}>
            <Input {...register("kind")} />
          </Field>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? tc("saving") : t("create")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LocationsView() {
  const { can } = usePermissions();
  const [zone, setZone] = useState("");
  const [active, setActive] = useState("");
  const [offset, setOffset] = useState(0);
  const locs = useLocations({ zone: zone || undefined, active: active === "" ? undefined : active === "true", offset });
  const update = useUpdateLocation();
  const t = useTranslations("warehouse.catalog.locations");
  const tc = useTranslations("common");
  const ts = useTranslations("status");

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title={t("title")} description={t("description")} actions={can("stock:adjust") ? <NewLocationDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Input className="max-w-xs" placeholder={t("zonePlaceholder")} value={zone} onChange={(e) => { setZone(e.target.value); setOffset(0); }} aria-label={t("zone")} />
          <Select className="w-40" value={active} onChange={(e) => { setActive(e.target.value); setOffset(0); }} aria-label={tc("status")}>
            <option value="">{tc("all")}</option><option value="true">{tc("active")}</option><option value="false">{tc("inactive")}</option>
          </Select>
        </div>
        <DataTable
          data={locs.data} isLoading={locs.isLoading} error={locs.error} onRetry={() => locs.refetch()}
          offset={offset} onOffsetChange={setOffset} emptyTitle={t("empty")}
          columns={[
            { header: t("code"), accessorKey: "code", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: t("zone"), accessorKey: "zone" },
            { header: t("kind"), accessorKey: "kind" },
            { header: tc("status"), accessorKey: "is_active", cell: (c) => <Badge tone={c.getValue() ? "success" : "neutral"}>{c.getValue() ? ts("active") : ts("inactive")}</Badge> },
            ...(can("stock:adjust")
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
