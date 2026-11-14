"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { shortId } from "@/lib/utils";
import { useFormatDate } from "@/lib/i18n/format";
import { ItemLabel, LocationLabel, useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useStockMovements } from "../hooks/use-inventory";

const TYPES = ["opening_balance", "receipt", "putaway", "pick", "adjustment_in", "adjustment_out"] as const;

export function MovementsView() {
  const { can } = usePermissions();
  const t = useTranslations("warehouse.inventory.movements");
  const tc = useTranslations("common");
  const tt = useTranslations("warehouse.movementTypes");
  const typeLabel = (v: string) => (tt.has(v as (typeof TYPES)[number]) ? tt(v as (typeof TYPES)[number]) : v.replaceAll("_", " "));
  const formatDate = useFormatDate();
  const { items } = useItemLookup();
  const { locations } = useLocationLookup();
  const [itemId, setItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [type, setType] = useState("");
  const [actor, setActor] = useState("");
  const [offset, setOffset] = useState(0);
  const reset = (fn: () => void) => { fn(); setOffset(0); };
  const q = useStockMovements({ item_id: itemId || undefined, location_id: locationId || undefined, movement_type: type || undefined, actor_id: actor || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title={t("title")} description={t("description")} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Select className="w-52" value={itemId} onChange={(e) => reset(() => setItemId(e.target.value))} aria-label={tc("item")}>
            <option value="">{tc("allItems")}</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          <Select className="w-40" value={locationId} onChange={(e) => reset(() => setLocationId(e.target.value))} aria-label={tc("location")}>
            <option value="">{tc("allLocations")}</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
          <Select className="w-44" value={type} onChange={(e) => reset(() => setType(e.target.value))} aria-label={t("movementType")}>
            <option value="">{t("allTypes")}</option>
            {TYPES.map((v) => <option key={v} value={v}>{tt(v)}</option>)}
          </Select>
          <Input className="w-56" placeholder={t("actorId")} value={actor} onChange={(e) => reset(() => setActor(e.target.value))} aria-label={t("actorId")} />
        </div>
        <DataTable
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle={t("empty")}
          columns={[
            { header: t("when"), accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            { header: t("type"), accessorKey: "movement_type", cell: (c) => <Badge>{typeLabel(c.getValue() as string)}</Badge> },
            { header: tc("item"), accessorKey: "item_id", cell: (c) => <ItemLabel id={c.getValue() as string} /> },
            { header: t("from"), accessorKey: "from_location_id", cell: (c) => <LocationLabel id={c.getValue() as string | null} /> },
            { header: t("to"), accessorKey: "to_location_id", cell: (c) => <LocationLabel id={c.getValue() as string | null} /> },
            { header: tc("qty"), accessorKey: "quantity", cell: (c) => <span className="font-semibold tabular-nums">{c.getValue() as number}</span> },
            { header: tc("reason"), accessorKey: "reason" },
            { header: t("actor"), accessorKey: "actor_id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
