import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import type { AppVariables } from "~/app";
import {
  createOperatingHoursPolicyRuleInput,
  operatingHoursPolicyRuleFiltersInput,
  updateOperatingHoursPolicyRuleInput,
} from "~/schema/operatingHoursPolicyRule";
import OperatingHoursPolicyRuleService from "~/services/operatingHoursPolicyRule";

// ---------------------------------------------------------------------------- //

const operatingHoursPolicyRuleService = new OperatingHoursPolicyRuleService();

type AppEnv = {
  Variables: AppVariables;
};
export const operatingHoursPolicyRuleRouter = new Hono<AppEnv>()

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result =
        await operatingHoursPolicyRuleService.getOperatingHoursPolicyRule(
          Number(id),
        );
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get OHPR with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get(
    "/",
    zValidator("query", operatingHoursPolicyRuleFiltersInput),
    async (c) => {
      const filters = c.req.valid("query");

      try {
        const results =
          await operatingHoursPolicyRuleService.listOperatingHoursPolicyRules(
            filters,
          );
        return c.json({ data: results }, 200);
      } catch (error) {
        console.error(`Failed to get OHPRs, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .post(
    "/",
    zValidator("json", createOperatingHoursPolicyRuleInput),
    async (c) => {
      const ohpr = c.req.valid("json");
      try {
        const result =
          await operatingHoursPolicyRuleService.createOperatingHoursPolicyRule(
            ohpr,
          );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to create OHPR, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .patch(
    "/:id",
    zValidator("json", updateOperatingHoursPolicyRuleInput),
    async (c) => {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const result =
          await operatingHoursPolicyRuleService.updateOperatingHoursPolicyRule(
            Number(id),
            updates,
          );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(`Failed to update OHPR with id ${id}, ${error}`);
        return c.json({ message: error }, 500);
      }
    },
  )

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await operatingHoursPolicyRuleService.deleteOperatingHoursPolicyRule(
        Number(id),
      );
    } catch (error) {
      console.error(`Failed to delete AWT with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });
