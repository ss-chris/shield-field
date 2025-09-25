import z from "zod";

import {
  purchaseOrderLineItemStatusEnum,
  purchaseOrderStatusEnum,
  warehouseTypeEnum,
} from "@safestreets/db/schema";

// Warehouse

export const warehouseFiltersInput = z.object({
  id: z.number().optional(),
  userId: z.string().optional(),
  type: z.enum(warehouseTypeEnum.enumValues).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type warehouseFilters = z.infer<typeof warehouseFiltersInput>;

// Warehouse Product Transaction

export const warehouseProductFiltersInput = z.object({
  id: z.number().optional(),
  warehouseId: z.number().optional(),
  productId: z.number().optional(),
  canBeOrdered: z.boolean().optional(),
});

export type warehouseProductFilters = z.infer<
  typeof warehouseProductFiltersInput
>;

// Warehouse Product Transaction

export const warehouseProductTransactionFiltersInput = z.object({
  id: z.number().optional(),
  warehouseId: z.number().optional(),
});

export type warehouseProductTransactionFilters = z.infer<
  typeof warehouseProductTransactionFiltersInput
>;

// Purchase Order Line Item

export const purchaseOrderLineItemFiltersInput = z.object({
  id: z.number().optional(),
  status: z.enum(purchaseOrderLineItemStatusEnum.enumValues).optional(),
  purchaseOrderIds: z.number().array().optional(),
});

export type purchaseOrderLineItemFilters = z.infer<
  typeof purchaseOrderLineItemFiltersInput
>;

// Purchase Order Shipment Tracking Event (poste)

export const posteFiltersInput = z.object({
  id: z.number().optional(),
  purchaseOrderShipmentId: z.number().optional(),
});

export type posteFilters = z.infer<typeof posteFiltersInput>;

// Purchase Order Shipment

export const purchaseOrderShipmentFiltersInput = z.object({
  id: z.number().optional(),
  purchaseOrderId: z.number().optional(),
});

export type purchaseOrderShipmentFilters = z.infer<
  typeof purchaseOrderShipmentFiltersInput
>;

// Purchase Order

export const purchaseOrderFiltersInput = z.object({
  id: z.number().optional(),
  type: z.string().optional(),
  statuses: z.enum(purchaseOrderStatusEnum.enumValues).array().optional(),
  parentPurchaseOrderId: z.number().optional(),
  warehouseId: z.number().optional(),
});

export type purchaseOrderFilters = z.infer<typeof purchaseOrderFiltersInput>;
