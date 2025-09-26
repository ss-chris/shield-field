import { and, eq } from "drizzle-orm";

import type {
  InsertOperatingHoursPolicyRule,
  UpdateOperatingHoursPolicyRule,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { operatingHoursPolicyRule } from "@safestreets/db/schema";

import type { operatingHoursPolicyRuleFilters } from "~/schema/operatingHoursPolicyRule";

class OperatingHoursPolicyRuleService {
  async getOperatingHoursPolicyRule(id: number) {
    const [result] = await db
      .select()
      .from(operatingHoursPolicyRule)
      .where(eq(operatingHoursPolicyRule.id, id));

    if (!result) {
      throw new Error(`Operating Hours Policy Rule with id ${id} not found`);
    }

    return result;
  }

  async listOperatingHoursPolicyRules(
    filters: operatingHoursPolicyRuleFilters,
  ) {
    let conditions = [];
    if (filters.policyId)
      conditions.push(eq(operatingHoursPolicyRule.policyId, filters.policyId));

    return db.query.operatingHoursPolicyRule.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createOperatingHoursPolicyRule(ohpr: InsertOperatingHoursPolicyRule) {
    const [result] = await db
      .insert(operatingHoursPolicyRule)
      .values(ohpr)
      .returning();
    return result;
  }

  async updateOperatingHoursPolicyRule(
    id: number,
    ohpr: UpdateOperatingHoursPolicyRule,
  ) {
    const [result] = await db
      .update(operatingHoursPolicyRule)
      .set(ohpr)
      .where(eq(operatingHoursPolicyRule.id, id))
      .returning();

    if (result) {
      throw new Error(`Operating Hours Policy Rule with id ${id} not found`);
    }

    return result;
  }

  async deleteOperatingHoursPolicyRule(id: number) {
    const [result] = await db
      .delete(operatingHoursPolicyRule)
      .where(eq(operatingHoursPolicyRule.id, id))
      .returning();

    if (!result) {
      throw new Error(`Operating Hours Policy Rule with id ${id} not found`);
    }

    return result;
  }
}

export default OperatingHoursPolicyRuleService;
