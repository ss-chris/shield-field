import { and, eq } from "drizzle-orm";

import type {
  InsertSchedulingPolicy,
  UpdateSchedulingPolicy,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { schedulingPolicy } from "@safestreets/db/schema";

import type { schedulingPolicyFilters } from "~/schema/schedulingPolicy";

class SchedulingPolicyService {
  async getSchedulingPolicy(id: number) {
    const [result] = await db
      .select()
      .from(schedulingPolicy)
      .where(eq(schedulingPolicy.id, id));

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }

  async listSchedulingPolicies(filters: schedulingPolicyFilters) {
    let conditions = [];
    conditions.push(eq(schedulingPolicy.organizationId, "1"));

    if (filters.operatingHoursPolicyId) {
      conditions.push(
        eq(
          schedulingPolicy.operatingHoursPolicyId,
          filters.operatingHoursPolicyId,
        ),
      );
    }

    if (filters.arrivalWindowTemplateId) {
      conditions.push(
        eq(
          schedulingPolicy.arrivalWindowTemplateId,
          filters.arrivalWindowTemplateId,
        ),
      );
    }

    return db.query.schedulingPolicy.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createSchedulingPolicy(sp: InsertSchedulingPolicy) {
    const [result] = await db.insert(schedulingPolicy).values(sp).returning();
    return result;
  }

  async updateSchedulingPolicy(id: number, sp: UpdateSchedulingPolicy) {
    const [result] = await db
      .update(schedulingPolicy)
      .set(sp)
      .where(eq(schedulingPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }

  async deleteSchedulingPolicy(id: number) {
    const [result] = await db
      .delete(schedulingPolicy)
      .where(eq(schedulingPolicy.id, id))
      .returning();

    if (!result) {
      throw new Error(`Scheduling Policy with id ${id} not found`);
    }

    return result;
  }
}

export default SchedulingPolicyService;
