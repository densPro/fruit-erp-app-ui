import { z } from "zod";

export const pickListSchema = z.object({
  reference: z.string().trim().max(100),
  lines: z
    .array(
      z.object({
        item_id: z.string().min(1, "Choose an item"),
        location_id: z.string().min(1, "Choose a bin"),
        quantity: z.coerce.number({ message: "Enter a number" }).int("Whole units only").positive("Must be greater than 0"),
      }),
    )
    .min(1, "Add at least one line"),
});
export type PickListValues = z.input<typeof pickListSchema>;
export type PickListPayload = z.output<typeof pickListSchema>;
