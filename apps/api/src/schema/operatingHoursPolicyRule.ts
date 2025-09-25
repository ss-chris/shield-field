import { z } from "zod";

export const operatingHoursPolicyRuleFiltersInput = z.object({
  id: z.number().optional(),
  policyId: z.number().optional(),
  dayOfWeek: z.number().min(1).max(7).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  earliestLeaveHomeTime: z.string().optional(),
  latestReturnHomeTime: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type operatingHoursPolicyRuleFilters = z.infer<
  typeof operatingHoursPolicyRuleFiltersInput
>;
