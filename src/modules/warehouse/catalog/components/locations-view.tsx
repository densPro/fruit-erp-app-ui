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
import { useCreateLocation, useLocations, useUpdateLocation } from "../hooks/use-catalog";
import { locationSchema, type LocationValues } from "../schemas";

function NewLocationDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateLocation();
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
        <Button><Plus /> New location</Button>
      </DialogTrigger>
      <DialogContent title="New location" description="A bin or dock where stock can be held.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="Code" error={formState.errors.code?.message}><Input {...register("code")} autoFocus /></Field>
          <Field label="Zone" error={formState.errors.zone?.message}><Input {...register("zone")} /></Field>
          <Field label="Kind" error={formState.errors.kind?.message} hint="e.g. storage, receiving">
            <Input {...register("kind")} />
          </Field>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create location"}</Button>
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

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Locations" description="Bins and docks. Stock can only be held in a location." actions={can("stock:adjust") ? <NewLocationDialog /> : undefined} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Input className="max-w-xs" placeholder="Filter by zone" value={zone} onChange={(e) => { setZone(e.target.value); setOffset(0); }} aria-label="Zone" />
          <Select className="w-40" value={active} onChange={(e) => { setActive(e.target.value); setOffset(0); }} aria-label="Status">
            <option value="">All</option><option value="true">Active</option><option value="false">Inactive</option>
          </Select>
        </div>
        <DataTable
          data={locs.data} isLoading={locs.isLoading} error={locs.error} onRetry={() => locs.refetch()}
          offset={offset} onOffsetChange={setOffset} emptyTitle="No locations found"
          columns={[
            { header: "Code", accessorKey: "code", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
            { header: "Zone", accessorKey: "zone" },
            { header: "Kind", accessorKey: "kind" },
            { header: "Status", accessorKey: "is_active", cell: (c) => <Badge tone={c.getValue() ? "success" : "neutral"}>{c.getValue() ? "active" : "inactive"}</Badge> },
            ...(can("stock:adjust")
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
