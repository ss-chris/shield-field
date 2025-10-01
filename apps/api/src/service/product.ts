import { db } from "@safestreets/db/client";

import type { productFilters } from "../schema/product";

class ProductService {
  async listProducts(filters: productFilters) {
    return db.query.product.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
    });
  }
}

export default ProductService;
