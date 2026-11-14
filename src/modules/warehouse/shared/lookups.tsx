"use client";
import { useQuery } from "@tanstack/react-query";
import { warehouseApi, type Page } from "@/lib/api";

export type ItemRef = { id: string; sku: string; name: string; unit: string; is_active: boolean };
export type LocationRef = { id: string; code: string; zone: string; kind: string; is_active: boolean };

/** Small reference lists (items, locations) loaded once so tables can show names instead of ids. */
export function useItemLookup() {
  const q = useQuery({
    queryKey: ["wh", "lookup", "items"],
    queryFn: () => warehouseApi.get<Page<ItemRef>>("/items", { limit: 200 }),
    staleTime: 60_000,
  });
  const byId = new Map((q.data?.items ?? []).map((i) => [i.id, i]));
  return { items: q.data?.items ?? [], byId, isLoading: q.isLoading };
}

export function useLocationLookup() {
  const q = useQuery({
    queryKey: ["wh", "lookup", "locations"],
    queryFn: () => warehouseApi.get<Page<LocationRef>>("/locations", { limit: 200 }),
    staleTime: 60_000,
  });
  const byId = new Map((q.data?.items ?? []).map((l) => [l.id, l]));
  return { locations: q.data?.items ?? [], byId, isLoading: q.isLoading };
}

export function ItemLabel({ id }: { id: string }) {
  const { byId } = useItemLookup();
  const i = byId.get(id);
  return i ? (
    <span>
      <span className="font-medium">{i.name}</span> <span className="font-mono text-xs text-muted-foreground">{i.sku}</span>
    </span>
  ) : (
    <span className="font-mono text-xs">{id.slice(0, 8)}</span>
  );
}

export function LocationLabel({ id }: { id: string | null | undefined }) {
  const { byId } = useLocationLookup();
  if (!id) return <span className="text-muted-foreground">-</span>;
  const l = byId.get(id);
  return <span className="font-mono text-xs">{l ? l.code : id.slice(0, 8)}</span>;
}
