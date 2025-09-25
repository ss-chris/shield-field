import { db } from "@acme/db/client";
import {
  FieldUserTerritory,
  FieldUserTerritoryInsert,
  Territory,
} from "@acme/db/schema";
import { and, eq } from "drizzle-orm";

import { fieldUserTerritoryFilters } from "~/schema/fieldUserTerritory";

class FieldUserTerritoryService {
  async getFieldUserTerritory(id: number) {
    const [result] = await db
      .select()
      .from(FieldUserTerritory)
      .leftJoin(Territory, eq(Territory.id, FieldUserTerritory.id))
      .where(eq(FieldUserTerritory.id, id));

    if (!result) {
      throw new Error(`Field Uer with id ${id} not found`);
    }

    return result;
  }

  async listFieldUserTerritories(filters?: fieldUserTerritoryFilters) {
    let conditions = [];
    conditions.push(eq(FieldUserTerritory.organizationId, 1));

    if (filters.userId) {
      conditions.push(eq(FieldUserTerritory.userId, filters.userId));
    }
    if (filters.territoryId) {
      conditions.push(eq(FieldUserTerritory.territoryId, filters.userId));
    }

    return db.query.FieldUserTerritory.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      with: { Territory: true },
      where: and(...conditions),
    });
  }

  async createFieldUserTerritory(fut: FieldUserTerritoryInsert) {
    return db.insert(FieldUserTerritory).values(fut).returning();
  }

  async updateFieldUserTerritory(
    id: number,
    futs: Partial<FieldUserTerritoryInsert>,
  ) {
    const [result] = await db
      .update(FieldUserTerritory)
      .set(futs)
      .where(eq(FieldUserTerritory.id, id))
      .returning();

    if (!result) {
      throw new Error(`Field Uer with id ${id} not found`);
    }

    return result;
  }

  async deleteFieldUserTerritory(id: number) {
    const [result] = await db
      .delete(FieldUserTerritory)
      .where(eq(FieldUserTerritory.id, id))
      .returning();

    if (!result) {
      throw new Error(`FUT with id ${id} not found`);
    }

    return result;
  }
}

export default FieldUserTerritoryService;
