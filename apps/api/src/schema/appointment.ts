import z from "zod";

import { appointmentStatusEnum } from "@safestreets/db/schema";

export const appointmentFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(appointmentStatusEnum.enumValues).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type appointmentFilters = z.infer<typeof appointmentFiltersInput>;
