import { z } from "zod";

export const userFiltersInput = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  warehouseId: z.number().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export type userFiltersInput = z.infer<typeof userFiltersInput>;
