import { serve } from "@hono/node-server";

import { app } from "./app";
import { env } from "./env";

serve(
  {
    fetch: app.fetch,
    port: env.API_PORT,
  },
  (info) => {
    console.log(`Server is running on :${info.port}`);
  },
);
