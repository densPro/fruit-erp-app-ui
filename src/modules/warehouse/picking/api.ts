import { warehouseApi, type Page } from "@/lib/api";
import type { PickList } from "./types";
import type { PickListPayload } from "./schemas";

export const pickingApi = {
  list: (p: { status?: string; reference?: string; limit: number; offset: number }) => warehouseApi.get<Page<PickList>>("/pick-lists", p),
  get: (id: string) => warehouseApi.get<PickList>(`/pick-lists/${id}`),
  create: (b: PickListPayload) => warehouseApi.post<PickList>("/pick-lists", b),
  confirm: (id: string, lineId: string, quantity?: number) => warehouseApi.post<PickList>(`/pick-lists/${id}/lines/${lineId}/picks`, quantity ? { quantity } : {}),
  cancel: (id: string) => warehouseApi.post<PickList>(`/pick-lists/${id}/cancellation`),
};
