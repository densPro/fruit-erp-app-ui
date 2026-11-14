"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api";

export function useStockLevels(p: { item_id?: string; location_id?: string; include_empty?: boolean; offset: number }) {
  return useQuery({ queryKey: ["wh", "levels", p], queryFn: () => inventoryApi.levels({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
export function useStockMovements(p: { item_id?: string; location_id?: string; movement_type?: string; actor_id?: string; offset: number }) {
  return useQuery({ queryKey: ["wh", "movements", p], queryFn: () => inventoryApi.movements({ ...p, limit: 20 }), placeholderData: keepPreviousData });
}
