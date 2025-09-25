import { and, eq, ilike } from "drizzle-orm";

import type { InsertArrivalWindowTemplate } from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { arrivalWindowTemplate } from "@safestreets/db/schema";

import type { arrivalWindowTemplateFilters } from "../schema/arrivalWindowTemplate";

class ArrivalWindowTemplateService {
  async listArrivalWindowTemplates(filters: arrivalWindowTemplateFilters) {
    let conditions = [];
    conditions.push(eq(arrivalWindowTemplate.organizationId, "1"));
    if (filters.id) {
      conditions.push(eq(arrivalWindowTemplate.id, filters.id));
    }
    if (filters.name) {
      conditions.push(ilike(arrivalWindowTemplate.name, filters.name));
    }

    return db.query.arrivalWindowTemplate.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getArrivalWindowTemplate(id: number) {
    const [result] = await db
      .select()
      .from(arrivalWindowTemplate)
      .where(eq(arrivalWindowTemplate.id, id));

    if (!result) {
      throw new Error(`Arrival Window Template with id ${id} not found`);
    }

    return result;
  }

  async createArrivalWindowTemplate(awt: InsertArrivalWindowTemplate) {
    const [result] = await db
      .insert(arrivalWindowTemplate)
      .values(awt)
      .returning();
    return result;
  }

  async updateArrivalWindowTemplate(
    id: number,
    awt: Partial<InsertArrivalWindowTemplate>,
  ) {
    const [result] = await db
      .update(arrivalWindowTemplate)
      .set(awt)
      .where(eq(arrivalWindowTemplate.id, id))
      .returning();

    if (result) {
      throw new Error(`Arrival Window Template with id ${id} not found`);
    }

    return result;
  }

  async deleteArrivalWindowTemplate(id: number) {
    const [result] = await db
      .delete(arrivalWindowTemplate)
      .where(eq(arrivalWindowTemplate.id, id))
      .returning();

    if (!result) {
      throw new Error(`Arrival Window Template with id ${id} not found`);
    }

    return result;
  }
}

export default ArrivalWindowTemplateService;
