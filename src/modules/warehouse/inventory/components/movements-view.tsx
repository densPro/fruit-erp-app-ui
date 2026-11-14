"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { DataTable } from "@/components/data/data-table";
import { PageHeader, RequirePermission } from "@/components/common/states";
import { usePermissions } from "@/lib/auth/use-me";
import { formatDate, shortId } from "@/lib/utils";
import { ItemLabel, LocationLabel, useItemLookup, useLocationLookup } from "../../shared/lookups";
import { useStockMovements } from "../hooks/use-inventory";

const TYPES = ["opening_balance", "receipt", "putaway", "pick", "adjustment_in", "adjustment_out"];

export function MovementsView() {
  const { can } = usePermissions();
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
      <PageHeader title="Movement ledger" description="Every stock change: who, when, why. Append-only audit trail." />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Select className="w-52" value={itemId} onChange={(e) => reset(() => setItemId(e.target.value))} aria-label="Item">
            <option value="">All items</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          <Select className="w-40" value={locationId} onChange={(e) => reset(() => setLocationId(e.target.value))} aria-label="Location">
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.code}</option>)}
          </Select>
          <Select className="w-44" value={type} onChange={(e) => reset(() => setType(e.target.value))} aria-label="Movement type">
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
          </Select>
          <Input className="w-56" placeholder="Actor id" value={actor} onChange={(e) => reset(() => setActor(e.target.value))} aria-label="Actor id" />
        </div>
        <DataTable
          data={q.data} isLoading={q.isLoading} error={q.error} onRetry={() => q.refetch()} offset={offset} onOffsetChange={setOffset}
          emptyTitle="No movements match these filters"
          columns={[
            { header: "When", accessorKey: "created_at", cell: (c) => formatDate(c.getValue() as string) },
            { header: "Type", accessorKey: "movement_type", cell: (c) => <Badge>{(c.getValue() as string).replaceAll("_", " ")}</Badge> },
            { header: "Item", accessorKey: "item_id", cell: (c) => <ItemLabel id={c.getValue() as string} /> },
            { header: "From", accessorKey: "from_location_id", cell: (c) => <LocationLabel id={c.getValue() as string | null} /> },
            { header: "To", accessorKey: "to_location_id", cell: (c) => <LocationLabel id={c.getValue() as string | null} /> },
            { header: "Qty", accessorKey: "quantity", cell: (c) => <span className="font-semibold tabular-nums">{c.getValue() as number}</span> },
            { header: "Reason", accessorKey: "reason" },
            { header: "Actor", accessorKey: "actor_id", cell: (c) => <span className="font-mono text-xs">{shortId(c.getValue() as string)}</span> },
          ]}
        />
      </Card>
    </RequirePermission>
  );
}
