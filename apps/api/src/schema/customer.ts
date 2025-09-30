import z from "zod";

import { customerStatusEnum } from "@safestreets/db/schema";

export const customerFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(customerStatusEnum.enumValues).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

enum PaymentMethod {
  ach = "ACH",
  cc = "Credit/Debit Card",
}

enum PaymentOption {
  loan,
  multipay,
  none,
}

export const sfBillingInput = z.object({
  accountId: z.string(),
  amount: z.number(),
  paymentMethod: z.enum(PaymentMethod),
  paymentMethodId: z.string(),
  paymentOption: z.enum(PaymentOption).default(PaymentOption.none).optional(),
  paymentOptionId: z.string().optional,
});

export type customerFilters = z.infer<typeof customerFiltersInput>;
export type sfBilling = z.infer<typeof sfBillingInput>;
