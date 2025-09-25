import { db } from "@acme/db/client";
import { Product, WarehouseProduct } from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import { productFilters } from "~/schema/product";

class ProductService {
  async listProducts(filters: productFilters) {
    let conditions = [];
    conditions.push(eq(Product.organizationId, 1));

    return db.query.Product.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }
}

export default ProductService;
