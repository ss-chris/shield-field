import { z } from "zod";

export const schedulingPolicyFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  arrivalWindowTemplateId: z.number().optional(),
  operatingHoursPolicyId: z.number().optional(),
});

export type schedulingPolicyFilters = z.infer<
  typeof schedulingPolicyFiltersInput
>;
