import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import z from "zod";

import { initAuth } from "@safestreets/auth";

import { env } from "./env";

const auth = initAuth({
  baseUrl: "http://localhost:5173",
  productionUrl: "http://localhost:5173",
  microsoftClientId: env.MICROSOFT_CLIENT_ID,
  microsoftClientSecret: env.MICROSOFT_CLIENT_SECRET,
  microsoftTenantId: env.MICROSOFT_TENANT_ID,
  secret: env.PRIMARY_DATABASE_URL,
});

export type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
  apiVersion: string;
};

export const app = new Hono<{
  Variables: AppVariables;
}>()
  .use(
    "*",
    cors({
      origin: "http://localhost:5173", // todo
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  })
  .get(
    "/ok",
    zValidator("query", z.object({ foo: z.enum(["bar", "baz"]) })),
    (c) => {
      return c.text("ok");
    },
  )
  // todo: would be nice to have this at root path as well but who cares right now
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  .get("/session", (c) => {
    const session = c.get("session");
    const user = c.get("user");

    if (!user) return c.body(null, 401);

    return c.json({ session, user });
  });

export type App = typeof app;
