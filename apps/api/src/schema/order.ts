import z from "zod";

import { orderStatusEnum } from "@safestreets/db/schema";

export const orderFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(orderStatusEnum.enumValues).optional(),
  customerId: z.number().optional(),
  appointmentId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type orderFilters = z.infer<typeof orderFiltersInput>;
