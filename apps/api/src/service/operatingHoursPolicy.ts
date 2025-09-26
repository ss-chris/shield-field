import { and, eq } from "drizzle-orm";

import type {
  InsertOperatingHoursPolicy,
  UpdateOperatingHoursPolicy,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { operatingHoursPolicy } from "@safestreets/db/schema";

import type { operatingHoursPolicyFilters } from "~/schema/operatingHoursPolicy";

class OperatingHoursPolicyService {
  async getOperatingHoursPolicy(id: number) {
    const [result] = await db
      .select()
      .from(operatingHoursPolicy)
      .where(eq(operatingHoursPolicy.id, id));

    if (!result) {
      throw new Error(`Operating Hours Policy with id ${id} not found`);
    }

    return result;
  }

  async listOperatingHoursPolicies(filters: operatingHoursPolicyFilters) {
    let conditions = [];
    conditions.push(eq(operatingHoursPolicy.organizationId, "1"));

    return db.query.operatingHoursPolicy.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createOperatingHoursPolicy(ohp: InsertOperatingHoursPolicy) {
    const [result] = await db
      .insert(operatingHoursPolicy)
      .values(ohp)
      .returning();
    return result;
  }

  async updateOperatingHoursPolicy(
    id: number,
    ohp: UpdateOperatingHoursPolicy,
  ) {
    const [result] = await db
      .update(operatingHoursPolicy)
      .set(ohp)
      .where(eq(operatingHoursPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Operating Hours Policy with id ${id} not found`);
    }

    return result;
  }

  async deleteOperatingHoursPolicy(id: number) {
    const [result] = await db
      .delete(operatingHoursPolicy)
      .where(eq(operatingHoursPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Operating Hours Policy with id ${id} not found`);
    }

    return result;
  }
}

export default OperatingHoursPolicyService;
