import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { insertOrderSchema, updateOrderSchema } from "@safestreets/db/schema";

import { orderFiltersInput } from "../schema/order";
import OrderService from "../service/order";

const orderService = new OrderService();

const orderRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const order = await orderService.getOrder(Number(id));
      return c.json({ data: order }, 200);
    } catch (error) {
      return c.json({ error: "Unable to fetch Order with id " + id }, 500);
    }
  })

  .get("/", zValidator("query", orderFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const orders = await orderService.listOrders(filters);
      return c.json(
        {
          data: orders,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list orders failed ", error);
      return c.json({ error: "Unable to fetch Orders - " + error }, 500);
    }
  })

  .post("/", zValidator("json", insertOrderSchema), async (c) => {
    const order = c.req.valid("json");

    try {
      const result = await orderService.createOrder(order);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create order failed", error);
      return c.json({ error: "Unable to create Order: " + error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateOrderSchema), async (c) => {
    const orderInput = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const result = await orderService.updateOrder(orderInput, Number(id));

      return c.json({ data: result });
    } catch (error) {
      console.error("get order failed ", error);
      return c.json({ error: "Unable to update Order" }, 500);
    }
  })

  .post("/sf/close-out-order/:orderId", async (c) => {
    const id = c.req.param("orderId");

    try {
      await orderService.createCloseOutOrderInSF(Number(id));
      return c.json(200);
    } catch (error) {
      console.error("create order failed", error);
      return c.json({ error: "Unable to create Order: " + error }, 500);
    }
  });

export default orderRouter;
