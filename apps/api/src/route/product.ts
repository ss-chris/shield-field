import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { productFiltersInput } from "../schema/product";
import ProductService from "../service/product";

const productService = new ProductService();

const productRouter = new Hono().get(
  "/",
  zValidator("query", productFiltersInput),
  async (c) => {
    const filters = c.req.valid("query");

    try {
      const results = await productService.listProducts(filters);
      return c.json({ data: results });
    } catch (error) {
      console.error(`Failed to get Products, ${error}`);
      return c.json({ message: error }, 500);
    }
  },
);

export default productRouter;
