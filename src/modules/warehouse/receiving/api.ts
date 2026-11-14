import { warehouseApi, type Page } from "@/lib/api";
import type { GoodsReceipt, PurchaseOrder } from "./types";
import type { PurchaseOrderPayload, ReceiptPayload } from "./schemas";

export const receivingApi = {
  listPOs: (p: { status?: string; limit: number; offset: number }) => warehouseApi.get<Page<PurchaseOrder>>("/purchase-orders", p),
  getPO: (id: string) => warehouseApi.get<PurchaseOrder>(`/purchase-orders/${id}`),
  createPO: (b: PurchaseOrderPayload) => warehouseApi.post<PurchaseOrder>("/purchase-orders", b),
  listReceipts: (p: { purchase_order_id?: string; has_discrepancy?: boolean; limit: number; offset: number }) =>
    warehouseApi.get<Page<GoodsReceipt>>("/goods-receipts", p),
  getReceipt: (id: string) => warehouseApi.get<GoodsReceipt>(`/goods-receipts/${id}`),
  createReceipt: (b: { purchase_order_id: string | null; notes: string; lines: ReceiptPayload["lines"] }) =>
    warehouseApi.post<GoodsReceipt>("/goods-receipts", b),
};
