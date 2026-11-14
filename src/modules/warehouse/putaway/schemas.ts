import { z } from "zod";

export const putawaySchema = z
  .object({
    item_id: z.string().min(1, "validation.chooseItem"),
    from_location_id: z.string().min(1, "validation.chooseSource"),
    to_location_id: z.string().min(1, "validation.chooseDestination"),
    quantity: z.coerce.number({ message: "validation.number" }).int("validation.wholeUnits").positive("validation.positive"),
    reason: z.string().trim().max(200, "validation.tooLong"),
  })
  .refine((v) => v.from_location_id !== v.to_location_id, { path: ["to_location_id"], message: "validation.differentBins" });
export type PutawayValues = z.input<typeof putawaySchema>;
export type PutawayPayload = z.output<typeof putawaySchema>;
