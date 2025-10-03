import z from "zod";

import { orderProductStatusEnum } from "@safestreets/db/schema";

export const orderProductFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(orderProductStatusEnum.enumValues).optional(),
  customerId: z.number().optional(),
  appointmentId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type orderProductFilters = z.infer<typeof orderProductFiltersInput>;
