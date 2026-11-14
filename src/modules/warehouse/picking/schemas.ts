import { z } from "zod";

export const pickListSchema = z.object({
  reference: z.string().trim().max(100, "validation.tooLong"),
  lines: z
    .array(
      z.object({
        item_id: z.string().min(1, "validation.chooseItem"),
        location_id: z.string().min(1, "validation.chooseBin"),
        quantity: z.coerce.number({ message: "validation.number" }).int("validation.wholeUnits").positive("validation.positive"),
      }),
    )
    .min(1, "validation.atLeastOneLine"),
});
export type PickListValues = z.input<typeof pickListSchema>;
export type PickListPayload = z.output<typeof pickListSchema>;
