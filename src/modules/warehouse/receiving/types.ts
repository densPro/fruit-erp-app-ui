export type PurchaseOrderLine = { id: string; item_id: string; ordered_qty: number; received_qty: number };
export type PurchaseOrder = { id: string; po_number: string; supplier: string; status: string; created_at: string; lines: PurchaseOrderLine[] };
export type ReceiptLine = {
  id: string; item_id: string; expected_qty: number | null; received_qty: number; discrepancy: "short" | "over" | "unexpected" | null; movement_id: string;
};
export type GoodsReceipt = {
  id: string; purchase_order_id: string | null; received_by: string; notes: string; has_discrepancy: boolean; created_at: string; lines: ReceiptLine[];
};
