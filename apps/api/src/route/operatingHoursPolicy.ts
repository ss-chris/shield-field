import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import type { AppVariables } from "~/app";
import {
  createOperatingHoursPolicyInput,
  operatingHoursPolicyFiltersInput,
  updateOperatingHoursPolicyInput,
} from "~/schema/operatingHoursPolicy";
import OperatingHoursPolicyService from "~/services/operatingHoursPolicy";

// ---------------------------------------------------------------------------- //

const operatingHoursPolicyService = new OperatingHoursPolicyService();

type AppEnv = {
  Variables: AppVariables;
};
export const operatingHoursPolicyRouter = new Hono<AppEnv>()

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result = await operatingHoursPolicyService.getOperatingHoursPolicy(
        Number(id),
      );
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get OHP with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get(
    "/",
    zValidator("query", operatingHoursPolicyFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const results =
          await operatingHoursPolicyService.listOperatingHoursPolicies(filters);
        return c.json({ data: results }, 200);
      } catch (error) {
        console.error(`Failed to get OHPs, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .post("/", zValidator("json", createOperatingHoursPolicyInput), async (c) => {
    const ohp = c.req.valid("json");

    try {
      const result =
        await operatingHoursPolicyService.createOperatingHoursPolicy(ohp);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to create OHP, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .patch(
    "/:id",
    zValidator("json", updateOperatingHoursPolicyInput),
    async (c) => {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const result =
          await operatingHoursPolicyService.updateOperatingHoursPolicy(
            Number(id),
            updates,
          );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to update OHP with id ${id}, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await operatingHoursPolicyService.deleteOperatingHoursPolicy(Number(id));
    } catch (error) {
      console.error(`Failed to delete OHP with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });
