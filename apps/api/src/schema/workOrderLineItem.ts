import z from "zod";

import { workOrderLineItemStatusEnum } from "@safestreets/db/schema";

export const workOrderLineItemFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(workOrderLineItemStatusEnum.enumValues).optional(),
  customerId: z.number().optional(),
  appointmentId: z.number().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type workOrderLineItemFilters = z.infer<
  typeof workOrderLineItemFiltersInput
>;
