"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { useFormatDate } from "@/lib/i18n/format";
import { ItemLabel, LocationLabel, useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useStockLevels } from "../hooks/use-inventory";

export function StockLevelsView() {
  const { can } = usePermissions();
  const t = useTranslations("warehouse.inventory.levels");
  const tc = useTranslations("common");
  const formatDate = useFormatDate();
  const { items } = useItemLookup();
  const { locations } = useLocationLookup();
  const [itemId, setItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [empty, setEmpty] = useState(false);
  const [offset, setOffset] = useState(0);
  const q = useStockLevels({ item_id: itemId || undefined, location_id: locationId || undefined, include_empty: empty || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title={t("title")} description={t("description")} />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Select className="w-56" value={itemId} onChange={(e) => { setItemId(e.target.value); setOffset(0); }} aria-label={tc("item")}>
            <option value="">{tc("allItems")}</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
          </Select>
          <Select className="w-44" value={locationId} onChange={(e) => { setLocationId(e.target.value); setOffset(0); }} aria-label={tc("location")}>
            <option value="">{tc("allLocations")}</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={empty} onChange={(e) => { setEmpty(e.target.checked); setOffset(0); }} className="size-4 accent-primary" />
            {t("includeEmpty")}
          </label>
        </div>
        <DataTable
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle={t("empty")} emptyHint={t("emptyHint")}
          columns={[
            { header: tc("item"), accessorKey: "item_id", cell: (c) => <ItemLabel id={c.getValue() as string} /> },
            { header: tc("location"), accessorKey: "location_id", cell: (c) => <LocationLabel id={c.getValue() as string} /> },
            { header: tc("quantity"), accessorKey: "quantity", cell: (c) => <span className="font-semibold tabular-nums">{c.getValue() as number}</span> },
            { header: tc("updated"), accessorKey: "updated_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
