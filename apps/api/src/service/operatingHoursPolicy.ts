import { db } from "@acme/db/client";
import {
  OperatingHoursPolicy,
  OperatingHoursPolicyInsert,
} from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import { operatingHoursPolicyFilters } from "~/schema/operatingHoursPolicy";

class OperatingHoursPolicyService {
  async getOperatingHoursPolicy(id: number) {
    const [result] = await db
      .select()
      .from(OperatingHoursPolicy)
      .where(eq(OperatingHoursPolicy.id, id));

    if (!result) {
      throw new Error(`OHP with id ${id} not found`);
    }

    return result;
  }

  async listOperatingHoursPolicies(filters?: operatingHoursPolicyFilters) {
    let conditions = [];
    conditions.push(eq(OperatingHoursPolicy.organizationId, 1));

    return db.query.OperatingHoursPolicy.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createOperatingHoursPolicy(ohp: OperatingHoursPolicyInsert) {
    const [result] = await db
      .insert(OperatingHoursPolicy)
      .values(ohp)
      .returning();
    return result;
  }

  async updateOperatingHoursPolicy(
    id: number,
    updates: Partial<OperatingHoursPolicyInsert>,
  ) {
    const [result] = await db
      .update(OperatingHoursPolicy)
      .set(updates)
      .where(eq(OperatingHoursPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`OHP with id ${id} not found`);
    }

    return result;
  }

  async deleteOperatingHoursPolicy(id: number) {
    const [result] = await db
      .delete(OperatingHoursPolicy)
      .where(eq(OperatingHoursPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`OHP with id ${id} not found`);
    }

    return result;
  }
}

export default OperatingHoursPolicyService;
