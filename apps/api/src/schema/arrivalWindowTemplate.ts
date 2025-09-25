import { z } from "zod";

export const arrivalWindowTemplateFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  stepMinutes: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type arrivalWindowTemplateFilters = z.infer<
  typeof arrivalWindowTemplateFiltersInput
>;
