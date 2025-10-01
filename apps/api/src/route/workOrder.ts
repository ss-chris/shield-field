import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertWorkOrderSchema,
  updateWorkOrderSchema,
} from "@safestreets/db/schema";

import { workOrderFiltersInput } from "../schema/workOrder";
import WorkOrderService from "../service/workOrder";

const workOrderService = new WorkOrderService();

const workOrderRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const workOrder = await workOrderService.getWorkOrder(Number(id));
      return c.json({ data: workOrder }, 200);
    } catch (error) {
      return c.json({ error: "Unable to fetch WorkOrder with id " + id }, 500);
    }
  })

  .get("/", zValidator("query", workOrderFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const workOrders = await workOrderService.listWorkOrders(filters);
      return c.json(
        {
          data: workOrders,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list workOrders failed ", error);
      return c.json({ error: "Unable to fetch WorkOrders - " + error }, 500);
    }
  })

  .post("/", zValidator("json", insertWorkOrderSchema), async (c) => {
    const workOrder = c.req.valid("json");

    try {
      const result = await workOrderService.createWorkOrder(workOrder);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create workOrder failed", error);
      return c.json({ error: "Unable to create WorkOrder: " + error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateWorkOrderSchema), async (c) => {
    const workOrderInput = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const result = await workOrderService.updateWorkOrder(
        workOrderInput,
        Number(id),
      );

      return c.json({ data: result });
    } catch (error) {
      console.error("get workOrder failed ", error);
      return c.json({ error: "Unable to update WorkOrder" }, 500);
    }
  });

export default workOrderRouter;
