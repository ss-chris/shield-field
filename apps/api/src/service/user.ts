import { db } from "@acme/db/client";
import { FieldUserWarehouse, Organization, User } from "@acme/db/schema";
import { and, eq, inArray } from "drizzle-orm";

import { userFilters } from "~/schema/user";

/**
 * Placeholder user service to be refined later for user creation, management, etc.
 * */

class UserService {
  async getUser(id: number) {
    const [result] = await db.select().from(User).where(eq(User.id, id));

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async listUsers(filters: userFilters) {
    let conditions = [];
    conditions.push(eq(User.organizationId, 1));

    if (filters.warehouseId) {
      const fieldUserWarehouses = await db
        .select()
        .from(FieldUserWarehouse)
        .where(eq(FieldUserWarehouse.warehouseId, filters.warehouseId));

      const userIds = fieldUserWarehouses.map((f) => {
        return f.userId;
      });

      conditions.push(inArray(User.id, userIds));
    }

    return db.query.SchedulingPolicy.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async createUser(user: userInsert) {
    const [result] = await db.insert(User).values(user).returning();
    return result;
  }

  async updateUser(id: number, user: Partial<userInsert>) {
    const [result] = await db
      .update(User)
      .set(user)
      .where(eq(User.id, id))
      .returning();

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async deleteUser(id: number) {
    const [result] = await db.delete(User).where(eq(User.id, id)).returning();

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }
}

export default UserService;
