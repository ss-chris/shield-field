import { and, eq } from "drizzle-orm";

import type {
  InsertWorkOrderLineItem,
  UpdateWorkOrderLineItem,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { workOrderLineItem } from "@safestreets/db/schema";

import type { workOrderLineItemFilters } from "../schema/workOrderLineItem";

class WorkOrderLineItemService {
  async listWorkOrderLineItems(filters: workOrderLineItemFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(workOrderLineItem.id, filters.id));
    }

    return db.query.workOrderLineItem.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getWorkOrderLineItem(id: number) {
    const [result] = await db
      .select()
      .from(workOrderLineItem)
      .where(eq(workOrderLineItem.id, id));

    if (!result) {
      throw new Error(`WorkOrderLineItem with id ${id} not found`);
    }

    return result;
  }

  async createWorkOrderLineItem(w: InsertWorkOrderLineItem) {
    const [result] = await db.insert(workOrderLineItem).values(w).returning();
    return result;
  }

  async updateWorkOrderLineItem(w: UpdateWorkOrderLineItem, id: number) {
    const [result] = await db
      .update(workOrderLineItem)
      .set(w)
      .where(eq(workOrderLineItem.id, id))
      .returning();

    if (!result) {
      throw new Error(`WorkOrderLineItem with id ${id} not found`);
    }

    return result;
  }
}

export default WorkOrderLineItemService;
