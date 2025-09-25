import { db } from "@acme/db/client";
import { SchedulingPolicy, SchedulingPolicyInsert } from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import { schedulingPolicyFilters } from "~/schema/schedulingPolicy";

class SchedulingPolicyService {
  async getSchedulingPolicy(id: number) {
    const [result] = await db
      .select()
      .from(SchedulingPolicy)
      .where(eq(SchedulingPolicy.id, id));

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }

  async listSchedulingPolicies(filters: schedulingPolicyFilters) {
    let conditions = [];
    conditions.push(eq(SchedulingPolicy.organizationId, 1));

    if (filters.operatingHoursPolicyId) {
      conditions.push(
        eq(
          SchedulingPolicy.operatingHoursPolicyId,
          filters.operatingHoursPolicyId,
        ),
      );
    }

    if (filters.arrivalWindowTemplateId) {
      conditions.push(
        eq(
          SchedulingPolicy.arrivalWindowTemplateId,
          filters.arrivalWindowTemplateId,
        ),
      );
    }

    return db.query.SchedulingPolicy.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createSchedulingPolicy(schedulingPolicy: SchedulingPolicyInsert) {
    const [result] = await db
      .insert(SchedulingPolicy)
      .values(schedulingPolicy)
      .returning();
    return result;
  }

  async updateSchedulingPolicy(
    id: number,
    schedulingPolicy: Partial<SchedulingPolicyInsert>,
  ) {
    const [result] = await db
      .update(SchedulingPolicy)
      .set(schedulingPolicy)
      .where(eq(SchedulingPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }

  async deleteSchedulingPolicy(id: number) {
    const [result] = await db
      .delete(SchedulingPolicy)
      .where(eq(SchedulingPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }
}

export default SchedulingPolicyService;
