export type PickLine = { id: string; item_id: string; location_id: string; quantity: number; picked_qty: number };
export type PickList = { id: string; reference: string; status: string; created_by: string; created_at: string; lines: PickLine[] };
