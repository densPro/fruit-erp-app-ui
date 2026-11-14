import { z } from "zod";

export const putawaySchema = z
  .object({
    item_id: z.string().min(1, "Choose an item"),
    from_location_id: z.string().min(1, "Choose the source bin"),
    to_location_id: z.string().min(1, "Choose the destination bin"),
    quantity: z.coerce.number({ message: "Enter a number" }).int("Whole units only").positive("Must be greater than 0"),
    reason: z.string().trim().max(200),
  })
  .refine((v) => v.from_location_id !== v.to_location_id, { path: ["to_location_id"], message: "Destination must differ from source" });
export type PutawayValues = z.input<typeof putawaySchema>;
export type PutawayPayload = z.output<typeof putawaySchema>;
