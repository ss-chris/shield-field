import { eq } from "drizzle-orm";

import type { InsertUser, UpdateUser } from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { user } from "@safestreets/db/schema";

import type { userFiltersInput } from "~/schema/user";

/**
 * Placeholder user service to be refined later for user creation, management, etc.
 * */

class UserService {
  async getUser(id: string) {
    const [result] = await db.select().from(user).where(eq(user.id, id));

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async listUsers(filters: userFiltersInput) {
    return db.query.user.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
    });
  }

  async createUser(u: InsertUser) {
    const [result] = await db.insert(user).values(u).returning();
    return result;
  }

  async updateUser(id: string, u: UpdateUser) {
    const [result] = await db
      .update(user)
      .set(u)
      .where(eq(user.id, id))
      .returning();

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async deleteUser(id: string) {
    const [result] = await db.delete(user).where(eq(user.id, id)).returning();

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }
}

export default UserService;
