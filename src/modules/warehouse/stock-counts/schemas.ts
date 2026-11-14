import { z } from "zod";

export const countedLinesSchema = z.object({
  lines: z.array(z.object({
    item_id: z.string().min(1),
    counted_qty: z.union([z.literal(""), z.coerce.number({ message: "validation.number" }).int("validation.wholeUnits").min(0, "validation.nonNegative")]),
  })),
});
export type CountedLinesValues = z.input<typeof countedLinesSchema>;

export const approveSchema = z.object({ reason: z.string().trim().min(3, "validation.reasonRequired").max(300, "validation.tooLong") });
export type ApproveValues = z.infer<typeof approveSchema>;
