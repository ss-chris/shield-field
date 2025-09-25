import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import type {
  InsertPurchaseOrder,
  InsertPurchaseOrderLineItem,
  SelectPurchaseOrder,
} from "@safestreets/db/schema";
import {
  insertPurchaseOrderLineItemSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderShipmentSchema,
  insertWarehouseProductSchema,
  insertWarehouseSchema,
  selectPurchaseOrderSchema,
  selectWarehouseSchema,
  updatePurchaseOrderLineItemSchema,
  updatePurchaseOrderShipmentSchema,
  updateWarehouseSchema,
} from "@safestreets/db/schema";

import type {
  purchaseOrderFilters,
  purchaseOrderLineItemFilters,
  warehouseProductFilters,
} from "../schema/inventory";
import {
  posteFiltersInput,
  purchaseOrderFiltersInput,
  purchaseOrderLineItemFiltersInput,
  purchaseOrderShipmentFiltersInput,
  warehouseFiltersInput,
  warehouseProductFiltersInput,
  warehouseProductTransactionFiltersInput,
} from "../schema/inventory";
import InventoryService from "../service/inventory";

const inventoryService = new InventoryService();

const inventoryRouter = new Hono()

  // Warehouse

  .get("/warehouse/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const warehouse = await inventoryService.getWarehouse(parseInt(id));
      return c.json({
        data: warehouse,
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Unable to fetch Warehouse with id " + id,
        success: false,
      });
    }
  })

  .get("/warehouse", zValidator("query", warehouseFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const warehouses = await inventoryService.listWarehouses(filters);
      return c.json({
        data: warehouses,
        limit: filters.limit,
        offset: filters.offset,
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Unable to fetch Warehouses",
        success: false,
      });
    }
  })

  .post("/warehouse", zValidator("json", insertWarehouseSchema), async (c) => {
    const warehouse = c.req.valid("json");

    try {
      const result = await inventoryService.createWarehouse(warehouse);
      return c.json({
        data: result,
        success: true,
      });
    } catch (error) {
      console.error("create warehouse failed", error);
      return c.json({
        error: "Unable to create Warehouse: " + error,
        success: false,
      });
    }
  })

  .patch(
    "/warehouse/:id",
    zValidator("json", updateWarehouseSchema),
    async (c) => {
      const warehouseInput = c.req.valid("json");
      const id = c.req.param("id");

      try {
        const result = await inventoryService.updateWarehouse(
          warehouseInput,
          parseInt(id),
        );

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to update Warehouse",
          success: false,
        });
      }
    },
  )

  // Warehouse Product

  .get(
    "/warehouse-product",
    zValidator("query", warehouseProductFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const warehouseProducts =
          await inventoryService.listWarehouseProducts(filters);
        return c.json({
          data: warehouseProducts,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to fetch Warehouse Products",
          success: false,
        });
      }
    },
  )

  .post(
    "/warehouse-product",
    zValidator("json", insertWarehouseProductSchema),
    async (c) => {
      const warehouseProductInput = c.req.valid("json");

      try {
        const result = await inventoryService.createWarehouseProduct(
          warehouseProductInput,
        );

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to create Warehouse Product",
          success: false,
        });
      }
    },
  )

  // Warehouse Product Transaction

  .get(
    "/warehouse-product-transaction",
    zValidator("query", warehouseProductTransactionFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const warehouseProductTransactions =
          await inventoryService.listWarehouseProductTransactions(filters);
        return c.json({
          data: warehouseProductTransactions,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to fetch Warehouse Product Transactions",
          success: false,
        });
      }
    },
  )

  // Purchase Order

  .get("/po", zValidator("query", purchaseOrderFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const purchaseOrders = await inventoryService.listPurchaseOrders(filters);
      return c.json({
        data: purchaseOrders,
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Unable to fetch Purchase Orders",
        success: false,
      });
    }
  })

  .post("/po", zValidator("json", insertPurchaseOrderSchema), async (c) => {
    const purchaseOrderInput = c.req.valid("json");

    try {
      const result =
        await inventoryService.createPurchaseOrder(purchaseOrderInput);

      return c.json({
        data: result,
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Unable to create Purchase Order",
        success: false,
      });
    }
  })

  .patch(
    "/po/:id",
    zValidator("json", selectPurchaseOrderSchema),
    async (c) => {
      const purchaseOrderInput = c.req.valid("json");
      const id = c.req.param("id");

      try {
        const result = await inventoryService.updatePurchaseOrder(
          purchaseOrderInput,
          parseInt(id),
        );

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to update Purchase Order - " + error,
          success: false,
        });
      }
    },
  )

  .post("/po/scheduled-create", async (c) => {
    try {
      const wpFilters: warehouseProductFilters = {
        canBeOrdered: true,
      };
      const poFilters: purchaseOrderFilters = {
        statuses: ["approved", "open"],
      };
      const wps = await inventoryService.listWarehouseProducts(wpFilters);
      const existingPos = await inventoryService.listPurchaseOrders(poFilters);

      let warehousePoMap = new Map<number, SelectPurchaseOrder>();
      let createPolis = [];
      for (const wp of wps) {
        // find related purchase order line items
        const relatedPos = existingPos.filter(
          (po) => po.destinationWarehouseId === wp.warehouseId,
        );

        const poliFilters: purchaseOrderLineItemFilters = {
          purchaseOrderIds: relatedPos.map(({ id }) => id),
        };
        const relatedPolis =
          await inventoryService.listPurchaseOrderLineItems(poliFilters);

        const amountFromPos =
          relatedPolis.length === 0
            ? 0
            : relatedPolis
                .map(({ quantityOrdered }) => quantityOrdered)
                .reduce((a, b) => a + b);

        // calculate on-hand product deficit
        let deficit = wp.desiredQuantity - wp.onHandQuantity - amountFromPos;
        if (deficit <= 0) {
          continue;
        }

        // create purchase orders, purchase order line items as needed
        let targetPo = warehousePoMap.get(wp.warehouseId);
        if (!targetPo) {
          const po: InsertPurchaseOrder = {
            type: "system",
            status: "open",
            destinationWarehouseId: wp.warehouseId,
          };
          targetPo = await inventoryService.createPurchaseOrder(po);
          warehousePoMap.set(wp.warehouseId, targetPo);
        }
        const poli: InsertPurchaseOrderLineItem = {
          status: "created",
          quantityOrdered: deficit,
          quantityReceived: 0,
          purchaseOrderId: targetPo.id,
          productId: wp.productId,
        };
        createPolis.push(poli);
      }

      if (createPolis.length > 0) {
        await inventoryService.createPurchaseOrderLineItems(createPolis);
      }

      console.log(
        `[Inventory] created ${warehousePoMap.size} new POs, ${createPolis.length} new POLIs`,
      );
      return c.json({
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Purchase Order creation process failed with error: " + error,
        success: false,
      });
    }
  })

  // Purchase Order Line Item

  .get(
    "/poli",
    zValidator("query", purchaseOrderLineItemFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const purchaseOrderLineItems =
          await inventoryService.listPurchaseOrderLineItems(filters);
        return c.json({
          data: purchaseOrderLineItems,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to fetch Purchase Order Line Items",
          success: false,
        });
      }
    },
  )

  .post(
    "/poli/batch",
    zValidator("json", insertPurchaseOrderLineItemSchema.array()),
    async (c) => {
      const poliInput = c.req.valid("json");

      try {
        const result =
          await inventoryService.createPurchaseOrderLineItems(poliInput);

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to create Purchase Order Line Items",
          success: false,
        });
      }
    },
  )

  .patch(
    "/poli/batch",
    zValidator("json", updatePurchaseOrderLineItemSchema.array()),
    async (c) => {
      const poliInput = c.req.valid("json");

      try {
        const result =
          await inventoryService.updatePurchaseOrderLineItems(poliInput);

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to update Purchase Order Line Items - " + error,
          success: false,
        });
      }
    },
  )

  // Purchase Order Shipment

  .get(
    "/po-shipment",
    zValidator("query", purchaseOrderShipmentFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const purchaseOrderShipments =
          await inventoryService.listPurchaseOrderShipments(filters);
        return c.json({
          data: purchaseOrderShipments,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to fetch Purchase Order Shipments",
          success: false,
        });
      }
    },
  )

  .post(
    "/po-shipment",
    zValidator("json", insertPurchaseOrderShipmentSchema),
    async (c) => {
      const purchaseOrderShipmentInput = c.req.valid("json");

      try {
        const result = await inventoryService.createPurchaseOrderShipment(
          purchaseOrderShipmentInput,
        );

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to create Purchase Order Shipment",
          success: false,
        });
      }
    },
  )

  .patch(
    "/po-shipment/:id",
    zValidator("json", updatePurchaseOrderShipmentSchema),
    async (c) => {
      const purchaseOrderShipmentInput = c.req.valid("json");
      const id = c.req.param("id");

      try {
        const result = await inventoryService.updatePurchaseOrderShipment(
          purchaseOrderShipmentInput,
          parseInt(id),
        );

        return c.json({
          data: result,
          success: true,
        });
      } catch (error) {
        return c.json({
          error: "Unable to update Purchase Order Shipment",
          success: false,
        });
      }
    },
  )

  // Purchase Order Shipment Tracking Event

  .get("/poste", zValidator("query", posteFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const postes =
        await inventoryService.listPurchaseOrderShipmentTrackingEvents(filters);
      return c.json({
        data: postes,
        success: true,
      });
    } catch (error) {
      return c.json({
        error: "Unable to fetch Purchase Order Shipment Tracking Events",
        success: false,
      });
    }
  });

export default inventoryRouter;
