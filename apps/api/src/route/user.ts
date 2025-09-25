import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

import { userFiltersInput } from "~/schema/user";
import UserService from "~/services/user";

const userService = new UserService();

export const userRouter = new Hono()
  .post(
    "/location/log",
    zValidator(
      "json",
      z.object({
        coordinates: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        speed: z.number(),
        recordedAt: z.number(),
      }),
    ),
    async (c) => {
      console.log(c.req.valid("json"));

      return c.json({
        ok: true,
      });
    },
  )

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result = await userService.getUser(Number(id));
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to get User with id - ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .get("/", zValidator("query", userFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    try {
      const results = await userService.listUsers(filters);
      return c.json({ data: results }, 200);
    } catch (error) {
      console.error(`Failed to get Users, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .post("/", zValidator("json", createSchedulingPolicyInput), async (c) => {
    const policy = c.req.valid("json");

    try {
      const result = await userService.createUser(policy);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to create User, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateSchedulingPolicyInput), async (c) => {
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    try {
      const result = await userService.updateUser(Number(id), updates);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error(`Failed to update User with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  })

  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      await userService.deleteUser(Number(id));
    } catch (error) {
      console.error(`Failed to delete User with id ${id}, ${error}`);
      return c.json({ message: error }, 500);
    }
  });
