import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertSchedulingPolicySchema,
  updateSchedulingPolicySchema,
} from "@safestreets/db/schema";

import type { AppVariables } from "../app";
import { schedulingPolicyFiltersInput } from "../schema/schedulingPolicy";
import SchedulingPolicyService from "../service/schedulingPolicy";

const schedulingPolicyService = new SchedulingPolicyService();

type AppEnv = {
  Variables: AppVariables;
};
const schedulingPolicyRouter = new Hono<AppEnv>()

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result = await schedulingPolicyService.getSchedulingPolicy(
        Number(id),
      );
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(
        `Failed to get Scheduling Policy with id - ${id}, ${error}`,
      );
      return c.json({ message: error }, 500);
    }
  })

  .get("/", zValidator("query", schedulingPolicyFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const results =
        await schedulingPolicyService.listSchedulingPolicies(filters);
      return c.json({ data: results }, 200);
    } catch (error) {
      console.error(`Failed to get Scheduling Policys, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .post("/", zValidator("json", insertSchedulingPolicySchema), async (c) => {
    const policy = c.req.valid("json");

    try {
      const result =
        await schedulingPolicyService.createSchedulingPolicy(policy);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to create Scheduling Policy, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .patch(
    "/:id",
    zValidator("json", updateSchedulingPolicySchema),
    async (c) => {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const result = await schedulingPolicyService.updateSchedulingPolicy(
          Number(id),
          updates,
        );
        return c.json({ data: result }, 200);
      } catch (error) {
        console.error(
          `Failed to update Scheduling Policy with id ${id}, ${error}`,
        );
        return c.json({ message: error }, 500);
      }
    },
  )

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await schedulingPolicyService.deleteSchedulingPolicy(Number(id));
    } catch (error) {
      console.error(
        `Failed to delete Scheduling Policy with id ${id}, ${error}`,
      );
      return c.json({ message: error }, 500);
    }
  });

export default schedulingPolicyRouter;
