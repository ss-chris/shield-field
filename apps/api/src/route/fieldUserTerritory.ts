import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";

import type { AppVariables } from "~/app";
import {
  createFieldUserTerritorySchema,
  fieldUserTerritoryFiltersInput,
  updateFieldUserTerritoryInput,
} from "~/schema/fieldUserTerritory";
import FieldUserTerritoryService from "~/services/fieldUserTerritory";

type AppEnv = {
  Variables: AppVariables;
};

const service = new FieldUserTerritoryService();

const fieldUserTerritoryRouter = new Hono<AppEnv>()

  .get("/:id", async (c: Context<AppEnv>) => {
    const id = c.req.param("id");

    try {
      const result = await service.getFieldUserTerritory(Number(id));
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get FUT with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get("/", zValidator("query", fieldUserTerritoryFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const results = await service.listFieldUserTerritories(filters);
      return c.json({ data: results }, 200);
    } catch (error) {
      console.error(`Failed to get FUTs, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .post("/", zValidator("json", createFieldUserTerritorySchema), async (c) => {
    const fieldUserTerritory = c.req.valid("json");

    try {
      const result = await service.createFieldUserTerritory(fieldUserTerritory);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to create FUT, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .patch(
    "/:id",
    zValidator("json", updateFieldUserTerritoryInput),
    async (c) => {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const result = await service.updateFieldUserTerritory(
          Number(id),
          updates,
        );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to update FUT with id ${id}, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await service.deleteFieldUserTerritory(Number(id));
    } catch (error) {
      console.error(`Failed to delete FUT with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });

export default fieldUserTerritoryRouter;
