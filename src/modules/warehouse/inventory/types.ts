export type StockLevel = { id: string; item_id: string; location_id: string; quantity: number; updated_at: string };
export type StockMovement = {
  id: string; item_id: string; from_location_id: string | null; to_location_id: string | null; quantity: number;
  movement_type: string; reason: string; reference_type: string | null; reference_id: string | null;
  actor_id: string; request_id: string | null; created_at: string;
};
