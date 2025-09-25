import { db } from "@acme/db/client";
import { Territory, territoryInsert } from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import type { territoryFilters } from "../schema/territory";

class TerritoryService {
  async getTerritory(id: number) {
    const [result] = await db
      .select()
      .from(Territory)
      .where(eq(Territory.id, id));

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }

  async listTerritories(filters: territoryFilters) {
    let conditions = [];
    conditions.push(eq(Territory.organizationId, 1));

    return db.query.Territory.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createTerritory(territory: territoryInsert) {
    const [result] = await db.insert(Territory).values(territory).returning();
    return result;
  }

  async updateTerritory(id: number, territory: Partial<territoryInsert>) {
    const [result] = await db
      .update(Territory)
      .set(territory)
      .where(eq(Territory.id, id))
      .returning();

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }

  async deleteTerritory(id: number) {
    const [result] = await db
      .delete(Territory)
      .where(eq(Territory.id, id))
      .returning();

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }
}

export default TerritoryService;
