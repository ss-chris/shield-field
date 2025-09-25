import { db } from "@acme/db/client";
import {
  CreateTerritorySchema,
  Territory,
  UpdateTerritorySchema,
} from "@acme/db/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import TerritoryService from "~/services/territory";
import { territoryFiltersInput } from "../schema/territory";

const territoryService = new TerritoryService();

export const territoryRouter = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result = await territoryService.getTerritory(Number(id));
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get Territory with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get("/", zValidator("query", territoryFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const results = await territoryService.listTerritories(filters);
      return c.json({ data: results }, 200);
    } catch (error) {
      console.error(`Failed to get Territories, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .post("/", zValidator("json", createSchedulingPolicyInput), async (c) => {
    const policy = c.req.valid("json");

    try {
      const result = await territoryService.createTerritory(policy);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to create Territory, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateSchedulingPolicyInput), async (c) => {
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    try {
      const result = await territoryService.updateTerritory(
        Number(id),
        updates,
      );
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to update Territory with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await territoryService.deleteTerritory(Number(id));
    } catch (error) {
      console.error(`Failed to delete Territory with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });
