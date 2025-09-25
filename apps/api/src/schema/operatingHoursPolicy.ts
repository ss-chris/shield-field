import { z } from "zod";

export const operatingHoursPolicyFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
});

export type operatingHoursPolicyFilters = z.infer<
  typeof operatingHoursPolicyFiltersInput
>;
