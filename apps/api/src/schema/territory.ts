import { z } from "zod";

export const territoryFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  userId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type territoryFilters = z.infer<typeof territoryFiltersInput>;
