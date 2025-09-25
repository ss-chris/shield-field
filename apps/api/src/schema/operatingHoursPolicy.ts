import { z } from "zod";

export const operatingHoursPolicyFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type operatingHoursPolicyFilters = z.infer<
  typeof operatingHoursPolicyFiltersInput
>;
