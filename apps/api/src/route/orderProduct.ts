import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertOrderProductSchema,
  updateOrderProductSchema,
} from "@safestreets/db/schema";

import { orderProductFiltersInput } from "../schema/orderProduct";
import OrderProductService from "../service/orderProduct";

const orderProductService = new OrderProductService();

const orderProductRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const orderProduct = await orderProductService.getOrderProduct(
        Number(id),
      );
      return c.json({ data: orderProduct }, 200);
    } catch (error) {
      return c.json(
        { error: "Unable to fetch OrderProduct with id " + id },
        500,
      );
    }
  })

  .get("/", zValidator("query", orderProductFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const orderProducts =
        await orderProductService.listOrderProducts(filters);
      return c.json(
        {
          data: orderProducts,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list orderProducts failed ", error);
      return c.json({ error: "Unable to fetch OrderProducts - " + error }, 500);
    }
  })

  .post("/", zValidator("json", insertOrderProductSchema), async (c) => {
    const orderProduct = c.req.valid("json");

    try {
      const result = await orderProductService.createOrderProduct(orderProduct);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create orderProduct failed", error);
      return c.json({ error: "Unable to create OrderProduct: " + error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateOrderProductSchema), async (c) => {
    const orderProductInput = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const result = await orderProductService.updateOrderProduct(
        orderProductInput,
        Number(id),
      );

      return c.json({ data: result });
    } catch (error) {
      console.error("get orderProduct failed ", error);
      return c.json({ error: "Unable to update OrderProduct" }, 500);
    }
  });

export default orderProductRouter;
