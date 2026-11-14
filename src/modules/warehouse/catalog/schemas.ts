import { z } from "zod";

export const itemSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  name: z.string().trim().min(1, "Name is required").max(200),
  unit: z.string().trim().min(1, "Unit is required").max(32),
});
export type ItemValues = z.infer<typeof itemSchema>;

export const itemEditSchema = itemSchema.omit({ sku: true });
export type ItemEditValues = z.infer<typeof itemEditSchema>;

export const locationSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(64),
  zone: z.string().trim().max(64),
  kind: z.string().trim().min(1, "Kind is required").max(32),
});
export type LocationValues = z.infer<typeof locationSchema>;
