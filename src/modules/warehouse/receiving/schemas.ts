import { z } from "zod";

const qty = z.coerce.number({ message: "validation.number" }).int("validation.wholeUnits").positive("validation.positive");

export const purchaseOrderSchema = z.object({
  po_number: z.string().trim().min(1, "validation.required").max(64, "validation.tooLong"),
  supplier: z.string().trim().max(200, "validation.tooLong"),
  lines: z.array(z.object({ item_id: z.string().min(1, "validation.chooseItem"), ordered_qty: qty })).min(1, "validation.atLeastOneLine"),
});
export type PurchaseOrderValues = z.input<typeof purchaseOrderSchema>;
export type PurchaseOrderPayload = z.output<typeof purchaseOrderSchema>;

export const receiptSchema = z.object({
  purchase_order_id: z.string(),
  notes: z.string().trim().max(500, "validation.tooLong"),
  lines: z.array(z.object({ item_id: z.string().min(1, "validation.chooseItem"), received_qty: qty })).min(1, "validation.atLeastOneLine"),
});
export type ReceiptValues = z.input<typeof receiptSchema>;
export type ReceiptPayload = z.output<typeof receiptSchema>;
