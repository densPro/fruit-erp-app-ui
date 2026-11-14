import { warehouseApi } from "@/lib/api";
import type { StockMovement } from "../inventory";
import type { PutawayPayload } from "./schemas";

export const putawayApi = { create: (b: PutawayPayload) => warehouseApi.post<StockMovement>("/putaways", b) };
