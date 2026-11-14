export type CountLine = {
  id: string; item_id: string; system_qty: number; counted_qty: number | null; adjustment_movement_id: string | null; variance: number | null;
};
export type StockCount = {
  id: string; location_id: string; status: "open" | "submitted" | "approved" | "cancelled"; opened_by: string; approved_by: string | null;
  approval_reason: string; created_at: string; approved_at: string | null; lines: CountLine[];
};
