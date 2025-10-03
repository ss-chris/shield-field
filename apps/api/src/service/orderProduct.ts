import { and, eq } from "drizzle-orm";

import type {
  InsertOrderProduct,
  UpdateOrderProduct,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { orderProduct } from "@safestreets/db/schema";

import type { orderProductFilters } from "../schema/orderProduct";

class OrderProductService {
  async listOrderProducts(filters: orderProductFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(orderProduct.id, filters.id));
    }

    return db.query.orderProduct.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getOrderProduct(id: number) {
    const [result] = await db
      .select()
      .from(orderProduct)
      .where(eq(orderProduct.id, id));

    if (!result) {
      throw new Error(`OrderProduct with id ${id} not found`);
    }

    return result;
  }

  async createOrderProduct(w: InsertOrderProduct) {
    const [result] = await db.insert(orderProduct).values(w).returning();
    return result;
  }

  async updateOrderProduct(w: UpdateOrderProduct, id: number) {
    const [result] = await db
      .update(orderProduct)
      .set(w)
      .where(eq(orderProduct.id, id))
      .returning();

    if (!result) {
      throw new Error(`OrderProduct with id ${id} not found`);
    }

    return result;
  }
}

export default OrderProductService;
