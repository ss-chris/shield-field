import { db } from "@acme/db/client";
import {
  ArrivalWindowTemplate,
  ArrivalWindowTemplateInsert,
} from "@acme/db/schema";
import { and, eq, ilike, like } from "drizzle-orm";
import z from "zod";

import { arrivalWindowTemplateFiltersInput } from "~/schema/arrivalWindowTemplate";

class ArrivalWindowTemplateService {
  async listArrivalWindowTemplates(filters: arrivalWindowTemplateFiltersInput) {
    let conditions = [];
    conditions.push(eq(ArrivalWindowTemplate.organizationId, 1));
    if (filters.id) {
      conditions.push(eq(ArrivalWindowTemplate.id, filters.id));
    }
    if (filters.name) {
      conditions.push(ilike(ArrivalWindowTemplate.name, filters.name));
    }

    return db.query.ArrivalWindowTemplate.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getArrivalWindowTemplate(id: number) {
    const [result] = await db
      .select()
      .from(ArrivalWindowTemplate)
      .where(eq(ArrivalWindowTemplate.id, id));

    if (!result) {
      throw new Error(`AWT with id ${id} not found`);
    }

    return result;
  }

  async createArrivalWindowTemplate(awt: ArrivalWindowTemplateInsert) {
    const [result] = await db
      .insert(ArrivalWindowTemplate)
      .values(awt)
      .returning();
    return result;
  }

  async updateArrivalWindowTemplate(
    id: number,
    awt: Partial<ArrivalWindowTemplateInsert>,
  ) {
    const [result] = await db
      .update(ArrivalWindowTemplate)
      .set(awt)
      .where(eq(ArrivalWindowTemplate.id, id))
      .returning();

    if (result) {
      throw new Error(`AWT with id ${id} not found`);
    }

    return result;
  }

  async deleteArrivalWindowTemplate(id: number) {
    const [result] = await db
      .delete(ArrivalWindowTemplate)
      .where(eq(ArrivalWindowTemplate.id, id))
      .returning();

    if (!result) {
      throw new Error(`AWT with id ${id} not found`);
    }

    return result;
  }
}

export default ArrivalWindowTemplateService;
