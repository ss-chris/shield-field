import type { Context } from "hono";

import type { AppVariables } from "~/app";

export function getAppVars(
  c: Context<{ Variables: AppVariables }>,
): AppVariables {
  return {
    user: c.get("user"),
    session: c.get("session"),
    apiVersion: c.get("apiVersion"),
  };
}
