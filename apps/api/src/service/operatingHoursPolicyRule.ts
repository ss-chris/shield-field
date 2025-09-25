import { db } from "@acme/db/client";
import {
  OperatingHoursPolicyRule,
  OperatingHoursPolicyRuleInsert,
} from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import { operatingHoursPolicyRuleFilters } from "~/schema/operatingHoursPolicyRule";

class OperatingHoursPolicyRuleService {
  async getOperatingHoursPolicyRule(id: number) {
    const [result] = await db
      .select()
      .from(OperatingHoursPolicyRule)
      .where(eq(OperatingHoursPolicyRule.id, id));

    if (!result) {
      throw new Error(`OHPR with id ${id} not found`);
    }

    return result;
  }

  async listOperatingHoursPolicyRules(
    filters?: operatingHoursPolicyRuleFilters,
  ) {
    let conditions = [];
    if (filters.operatingHoursPolicyId)
      conditions.push(
        eq(
          OperatingHoursPolicyRule.operatingHoursPolicyId,
          filters.operatingHoursPolicyId,
        ),
      );

    return db.query.OperatingHoursPolicyRule.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createOperatingHoursPolicyRule(ohpr: OperatingHoursPolicyRuleInsert) {
    const [result] = await db
      .insert(OperatingHoursPolicyRule)
      .values(ohpr)
      .returning();
    return result;
  }

  async updateOperatingHoursPolicyRule(
    id: number,
    ohpr: Partial<OperatingHoursPolicyRuleInsert>,
  ) {
    const [result] = await db
      .update(OperatingHoursPolicyRule)
      .set(ohpr)
      .where(eq(OperatingHoursPolicyRule.id, id))
      .returning();

    if (result) {
      throw new Error(`OHPR with id ${id} not found`);
    }

    return result;
  }

  async deleteOperatingHoursPolicyRule(id: number) {
    const [result] = await db
      .delete(OperatingHoursPolicyRule)
      .where(eq(OperatingHoursPolicyRule.id, id))
      .returning();

    if (!result) {
      throw new Error(`OHPR with id ${id} not found`);
    }

    return result;
  }
}

export default OperatingHoursPolicyRuleService;
