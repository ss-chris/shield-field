import {
  CreatePurchaseOrderLineItemSchema,
  CreatePurchaseOrderLineItemType,
  CreatePurchaseOrderSchema,
  CreatePurchaseOrderShipmentSchema,
  CreatePurchaseOrderType,
  CreateWarehouseProductSchema,
  CreateWarehouseSchema,
  PurchaseOrderType,
  UpdatePurchaseOrderLineItemSchema,
  UpdatePurchaseOrderSchema,
  UpdatePurchaseOrderShipmentSchema,
  UpdateWarehouseSchema,
} from "@acme/db/schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  posteFiltersInput,
  purchaseOrderFilters,
  purchaseOrderFiltersInput,
  purchaseOrderLineItemFilters,
  purchaseOrderLineItemFiltersInput,
  purchaseOrderShipmentFiltersInput,
  warehouseFiltersInput,
  warehouseProductFilters,
  warehouseProductFiltersInput,
  warehouseProductTransactionFiltersInput,
} from "~/schema/inventory";
import InventoryService from "~/services/inventory";

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
        error: "Unable to fetch warehouse with id " + id,
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
        error: "Unable to fetch warehouses",
        success: false,
      });
    }
  })

  .post("/warehouse", zValidator("json", CreateWarehouseSchema), async (c) => {
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
        error: "Unable to create warehouse: " + error,
        success: false,
      });
    }
  })

  .patch(
    "/warehouse/:id",
    zValidator("json", UpdateWarehouseSchema),
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
          error: "Unable to update warehouse",
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
          error: "Unable to fetch warehouse products",
          success: false,
        });
      }
    },
  )

  .post(
    "/warehouse-product",
    zValidator("json", CreateWarehouseProductSchema),
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
          error: "Unable to create warehouseProduct",
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
          error: "Unable to fetch warehouse product transactions",
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
        error: "Unable to fetch purchase orders",
        success: false,
      });
    }
  })

  .post("/po", zValidator("json", CreatePurchaseOrderSchema), async (c) => {
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
        error: "Unable to create purchase order",
        success: false,
      });
    }
  })

  .patch(
    "/po/:id",
    zValidator("json", UpdatePurchaseOrderSchema),
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
          error: "Unable to update purchase order - " + error,
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

      let warehousePoMap = new Map<number, PurchaseOrderType>();
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
          const po: CreatePurchaseOrderType = {
            type: "system",
            status: "open",
            destinationWarehouseId: wp.warehouseId,
          };
          targetPo = await inventoryService.createPurchaseOrder(po);
          warehousePoMap.set(wp.warehouseId, targetPo);
        }
        const poli: CreatePurchaseOrderLineItemType = {
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
        error: "PO creation process failed with error: " + error,
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
          error: "Unable to fetch purchase order line items",
          success: false,
        });
      }
    },
  )

  .post(
    "/poli/batch",
    zValidator("json", CreatePurchaseOrderLineItemSchema.array()),
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
          error: "Unable to create purchase order line items",
          success: false,
        });
      }
    },
  )

  .patch(
    "/poli/batch",
    zValidator("json", UpdatePurchaseOrderLineItemSchema.array()),
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
          error: "Unable to update purchase order line items - " + error,
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
          error: "Unable to fetch purchase order shipments",
          success: false,
        });
      }
    },
  )

  .post(
    "/po-shipment",
    zValidator("json", CreatePurchaseOrderShipmentSchema),
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
          error: "Unable to create purchase order shipment",
          success: false,
        });
      }
    },
  )

  .patch(
    "/po-shipment/:id",
    zValidator("json", UpdatePurchaseOrderShipmentSchema),
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
          error: "Unable to update purchase order shipment",
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
        error: "Unable to fetch purchase order shipment tracking events",
        success: false,
      });
    }
  });

export default inventoryRouter;
