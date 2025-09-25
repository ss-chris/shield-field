import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import type { AppVariables } from "~/app";
import {
  arrivalWindowTemplateFiltersInput,
  createArrivalWindowTemplateInput,
  updateArrivalWindowTemplateInput,
} from "~/schema/arrivalWindowTemplate";
import ArrivalWindowTemplateService from "~/services/arrivalWindowTemplate";

// ---------------------------------------------------------------------------- //

const arrivalWindowTemplateService = new ArrivalWindowTemplateService();

type AppEnv = {
  Variables: AppVariables;
};
export const arrivalWindowTemplateRouter = new Hono<AppEnv>()

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result =
        await arrivalWindowTemplateService.getArrivalWindowTemplate(Number(id));
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get AWT with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get(
    "/",
    zValidator("query", arrivalWindowTemplateFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const results =
          await arrivalWindowTemplateService.listArrivalWindowTemplates(
            filters,
          );
        return c.json({ data: results }, 200);
      } catch (error) {
        console.error(`Failed to list AWTs, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .post(
    "/",
    zValidator("json", createArrivalWindowTemplateInput),
    async (c) => {
      const template = c.req.valid("json");

      try {
        const result =
          await arrivalWindowTemplateService.createArrivalWindowTemplate(
            template,
          );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to create AWT, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .patch(
    "/:id",
    zValidator("json", updateArrivalWindowTemplateInput),
    async (c) => {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const result =
          await arrivalWindowTemplateService.updateArrivalWindowTemplate(
            Number(id),
            updates,
          );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to update AWT, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await arrivalWindowTemplateService.deleteArrivalWindowTemplate(
        Number(id),
      );
    } catch (error) {
      console.error(`Failed to delete AWT with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });
