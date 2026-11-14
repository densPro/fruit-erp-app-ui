import { warehouseApi, type Page } from "@/lib/api";
import type { StockLevel, StockMovement } from "./types";

export const inventoryApi = {
  levels: (p: { item_id?: string; location_id?: string; include_empty?: boolean; limit: number; offset: number }) =>
    warehouseApi.get<Page<StockLevel>>("/stock-levels", p),
  movements: (p: { item_id?: string; location_id?: string; movement_type?: string; actor_id?: string; limit: number; offset: number }) =>
    warehouseApi.get<Page<StockMovement>>("/stock-movements", p),
};
