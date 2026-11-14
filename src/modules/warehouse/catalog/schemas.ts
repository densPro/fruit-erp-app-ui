import { z } from "zod";

export const itemSchema = z.object({
  sku: z.string().trim().min(1, "validation.required").max(64, "validation.tooLong"),
  name: z.string().trim().min(1, "validation.required").max(200, "validation.tooLong"),
  unit: z.string().trim().min(1, "validation.required").max(32, "validation.tooLong"),
});
export type ItemValues = z.infer<typeof itemSchema>;

export const itemEditSchema = itemSchema.omit({ sku: true });
export type ItemEditValues = z.infer<typeof itemEditSchema>;

export const locationSchema = z.object({
  code: z.string().trim().min(1, "validation.required").max(64, "validation.tooLong"),
  zone: z.string().trim().max(64, "validation.tooLong"),
  kind: z.string().trim().min(1, "validation.required").max(32, "validation.tooLong"),
});
export type LocationValues = z.infer<typeof locationSchema>;
