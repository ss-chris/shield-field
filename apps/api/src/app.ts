import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import z from "zod";

import { initAuth } from "@safestreets/auth";

import { env } from "~/env";
import appointmentRouter from "~/route/appointment";
import { arrivalWindowTemplateRouter } from "~/route/arrivalWindowTemplate";
import customerRouter from "~/route/customer";
import inventoryRouter from "~/route/inventory";
import { operatingHoursPolicyRouter } from "~/route/operatingHoursPolicy";
import { operatingHoursPolicyRuleRouter } from "~/route/operatingHoursPolicyRule";
import productRouter from "~/route/product";
import { schedulingRouter } from "~/route/scheduling";
import { schedulingPolicyRouter } from "~/route/schedulingPolicy";
import { territoryRouter } from "~/route/territory";
import { userRouter } from "~/route/user";
import workOrderRouter from "~/route/workOrder";
import workOrderLineItemRouter from "~/route/workOrderLineItem";

const auth = initAuth({
  baseUrl: "http://localhost:5173",
  productionUrl: "http://localhost:5173",
  microsoftClientId: env.MICROSOFT_CLIENT_ID,
  microsoftClientSecret: env.MICROSOFT_CLIENT_SECRET,
  microsoftTenantId: env.MICROSOFT_TENANT_ID,
  secret: env.AUTH_SECRET,
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
  })
  .route("/inventory", inventoryRouter)
  .route("/appointment", appointmentRouter)
  .route("/arrival-window-template", arrivalWindowTemplateRouter)
  .route("/customer", customerRouter)
  .route("/operating-hours-policy", operatingHoursPolicyRouter)
  .route("/operating-hours-policy-rule", operatingHoursPolicyRuleRouter)
  .route("/product", productRouter)
  .route("/scheduling", schedulingRouter)
  .route("/scheduling-policy", schedulingPolicyRouter)
  .route("/territory", territoryRouter)
  .route("/user", userRouter)
  .route("/work-order", workOrderRouter)
  .route("/work-order-line-item", workOrderLineItemRouter);

export type App = typeof app;
