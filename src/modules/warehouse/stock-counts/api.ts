import { warehouseApi, type Page } from "@/lib/api";
import type { StockCount } from "./types";

export const stockCountsApi = {
  list: (p: { status?: string; location_id?: string; limit: number; offset: number }) => warehouseApi.get<Page<StockCount>>("/stock-counts", p),
  get: (id: string) => warehouseApi.get<StockCount>(`/stock-counts/${id}`),
  open: (location_id: string) => warehouseApi.post<StockCount>("/stock-counts", { location_id }),
  record: (id: string, lines: { item_id: string; counted_qty: number }[]) => warehouseApi.put<StockCount>(`/stock-counts/${id}/lines`, { lines }),
  submit: (id: string) => warehouseApi.post<StockCount>(`/stock-counts/${id}/submission`),
  approve: (id: string, reason: string) => warehouseApi.post<StockCount>(`/stock-counts/${id}/approval`, { reason }),
  cancel: (id: string) => warehouseApi.post<StockCount>(`/stock-counts/${id}/cancellation`),
};
