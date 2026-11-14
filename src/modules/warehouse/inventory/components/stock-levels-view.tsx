"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { formatDate } from "@/lib/utils";
import { ItemLabel, LocationLabel, useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useStockLevels } from "../hooks/use-inventory";

export function StockLevelsView() {
  const { can } = usePermissions();
  const { items } = useItemLookup();
  const { locations } = useLocationLookup();
  const [itemId, setItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [empty, setEmpty] = useState(false);
  const [offset, setOffset] = useState(0);
  const q = useStockLevels({ item_id: itemId || undefined, location_id: locationId || undefined, include_empty: empty || undefined, offset });

  return (
    <RequirePermission allowed={can("stock:view")}>
      <PageHeader title="Stock levels" description="Current quantity of each item in each location." />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Select className="w-56" value={itemId} onChange={(e) => { setItemId(e.target.value); setOffset(0); }} aria-label="Item">
            <option value="">All items</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
          </Select>
          <Select className="w-44" value={locationId} onChange={(e) => { setLocationId(e.target.value); setOffset(0); }} aria-label="Location">
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={empty} onChange={(e) => { setEmpty(e.target.checked); setOffset(0); }} className="size-4 accent-primary" />
            Include empty
          </label>
        </div>
        <DataTable
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No stock found" emptyHint="Receive a delivery to put stock into the warehouse."
          columns={[
            { header: "Item", accessorKey: "item_id", cell: (c) => <ItemLabel id={c.getValue() as string} /> },
            { header: "Location", accessorKey: "location_id", cell: (c) => <LocationLabel id={c.getValue() as string} /> },
            { header: "Quantity", accessorKey: "quantity", cell: (c) => <span className="font-semibold tabular-nums">{c.getValue() as number}</span> },
            { header: "Updated", accessorKey: "updated_at", cell: (c) => formatDate(c.getValue() as string) },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
