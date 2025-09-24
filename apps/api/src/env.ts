import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PRIMARY_DATABASE_URL: z.url().startsWith("postgresql://"),
    MICROSOFT_CLIENT_ID: z.string().length(36),
    MICROSOFT_CLIENT_SECRET: z.string().length(40),
    MICROSOFT_TENANT_ID: z.string().length(36),
    AUTH_SECRET: z.string(),
  },
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   */
  emptyStringAsUndefined: true,
});
