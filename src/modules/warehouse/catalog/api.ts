import { warehouseApi, type Page } from "@/lib/api";
import type { Item, Location } from "./types";
import type { ItemValues, LocationValues } from "./schemas";

export const catalogApi = {
  listItems: (p: { q?: string; active?: boolean; limit: number; offset: number }) => warehouseApi.get<Page<Item>>("/items", p),
  createItem: (b: ItemValues) => warehouseApi.post<Item>("/items", b),
  updateItem: (id: string, b: { name?: string; unit?: string; is_active?: boolean }) => warehouseApi.patch<Item>(`/items/${id}`, b),
  listLocations: (p: { zone?: string; active?: boolean; limit: number; offset: number }) => warehouseApi.get<Page<Location>>("/locations", p),
  createLocation: (b: LocationValues) => warehouseApi.post<Location>("/locations", b),
  updateLocation: (id: string, b: { zone?: string; is_active?: boolean }) => warehouseApi.patch<Location>(`/locations/${id}`, b),
};
