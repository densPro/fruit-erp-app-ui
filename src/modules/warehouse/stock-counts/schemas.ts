import { z } from "zod";

export const countedLinesSchema = z.object({
  lines: z.array(z.object({
    item_id: z.string().min(1),
    counted_qty: z.union([z.literal(""), z.coerce.number().int("Whole units only").min(0, "Cannot be negative")]),
  })),
});
export type CountedLinesValues = z.input<typeof countedLinesSchema>;

export const approveSchema = z.object({ reason: z.string().trim().min(3, "A reason is required").max(300) });
export type ApproveValues = z.infer<typeof approveSchema>;
