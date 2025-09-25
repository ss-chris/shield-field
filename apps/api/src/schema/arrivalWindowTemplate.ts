import { z } from "zod";

export const arrivalWindowTemplateFiltersInput = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  name: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  stepMinutes: z.number().int().min(0).optional(),
});
