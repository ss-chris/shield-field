import { eq } from "drizzle-orm";

import type { InsertTerritory, UpdateTerritory } from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { territory } from "@safestreets/db/schema";

import type { territoryFilters } from "../schema/territory";

class TerritoryService {
  async getTerritory(id: number) {
    const [result] = await db
      .select()
      .from(territory)
      .where(eq(territory.id, id));

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }

  async listTerritories(filters: territoryFilters) {
    return db.query.territory.findMany();
  }

  async createTerritory(t: InsertTerritory) {
    const [result] = await db.insert(territory).values(t).returning();
    return result;
  }

  async updateTerritory(id: number, t: UpdateTerritory) {
    const [result] = await db
      .update(territory)
      .set(t)
      .where(eq(territory.id, id))
      .returning();

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }

  async deleteTerritory(id: number) {
    const [result] = await db
      .delete(territory)
      .where(eq(territory.id, id))
      .returning();

    if (!result) {
      throw new Error(`Territory with id ${id} not found`);
    }

    return result;
  }
}

export default TerritoryService;
