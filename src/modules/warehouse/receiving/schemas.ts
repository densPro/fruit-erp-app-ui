import { z } from "zod";

const qty = z.coerce.number({ message: "Enter a number" }).int("Whole units only").positive("Must be greater than 0");

export const purchaseOrderSchema = z.object({
  po_number: z.string().trim().min(1, "PO number is required").max(64),
  supplier: z.string().trim().max(200),
  lines: z.array(z.object({ item_id: z.string().min(1, "Choose an item"), ordered_qty: qty })).min(1, "Add at least one line"),
});
export type PurchaseOrderValues = z.input<typeof purchaseOrderSchema>;
export type PurchaseOrderPayload = z.output<typeof purchaseOrderSchema>;

export const receiptSchema = z.object({
  purchase_order_id: z.string(),
  notes: z.string().trim().max(500),
  lines: z.array(z.object({ item_id: z.string().min(1, "Choose an item"), received_qty: qty })).min(1, "Add at least one line"),
});
export type ReceiptValues = z.input<typeof receiptSchema>;
export type ReceiptPayload = z.output<typeof receiptSchema>;
