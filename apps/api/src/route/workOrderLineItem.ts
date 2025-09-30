import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertWorkOrderLineItemSchema,
  updateWorkOrderLineItemSchema,
} from "@safestreets/db/schema";

import { workOrderLineItemFiltersInput } from "~/schema/workOrderLineItem";
import WorkOrderLineItemService from "~/service/workOrderLineItem";

const workOrderLineItemService = new WorkOrderLineItemService();

const workOrderLineItemRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const workOrderLineItem =
        await workOrderLineItemService.getWorkOrderLineItem(Number(id));
      return c.json({ data: workOrderLineItem }, 200);
    } catch (error) {
      return c.json(
        { error: "Unable to fetch WorkOrderLineItem with id " + id },
        500,
      );
    }
  })

  .get("/", zValidator("query", workOrderLineItemFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const workOrderLineItems =
        await workOrderLineItemService.listWorkOrderLineItems(filters);
      return c.json(
        {
          data: workOrderLineItems,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list workOrderLineItems failed ", error);
      return c.json(
        { error: "Unable to fetch WorkOrderLineItems - " + error },
        500,
      );
    }
  })

  .post("/", zValidator("json", insertWorkOrderLineItemSchema), async (c) => {
    const workOrderLineItem = c.req.valid("json");

    try {
      const result =
        await workOrderLineItemService.createWorkOrderLineItem(
          workOrderLineItem,
        );
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create workOrderLineItem failed", error);
      return c.json(
        { error: "Unable to create WorkOrderLineItem: " + error },
        500,
      );
    }
  })

  .patch(
    "/:id",
    zValidator("json", updateWorkOrderLineItemSchema),
    async (c) => {
      const workOrderLineItemInput = c.req.valid("json");
      const id = c.req.param("id");

      try {
        const result = await workOrderLineItemService.updateWorkOrderLineItem(
          workOrderLineItemInput,
          Number(id),
        );

        return c.json({ data: result });
      } catch (error) {
        console.error("get workOrderLineItem failed ", error);
        return c.json({ error: "Unable to update WorkOrderLineItem" }, 500);
      }
    },
  );

export default workOrderLineItemRouter;
