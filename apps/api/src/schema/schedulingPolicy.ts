import { z } from "zod";

export const schedulingPolicyFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  arrivalWindowTemplateId: z.number().optional(),
  operatingHoursPolicyId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type schedulingPolicyFilters = z.infer<
  typeof schedulingPolicyFiltersInput
>;
