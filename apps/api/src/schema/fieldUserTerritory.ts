import { z } from "zod";

export const fieldUserTerritoryFiltersInput = z.object({
  fieldUserId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export type fieldUserTerritoryFilters = z.infer<
  typeof fieldUserTerritoryFiltersInput
>;
