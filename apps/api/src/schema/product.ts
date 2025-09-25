import z from "zod";

export const productFiltersInput = z.object({
  id: z.number().optional(),
  externalId: z.string().optional(),
  warehouseId: z.coerce.number().int().min(1).max(100).default(50).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export type productFilters = z.infer<typeof productFiltersInput>;
