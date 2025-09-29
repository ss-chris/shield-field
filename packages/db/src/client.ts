import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { withReplicas } from "drizzle-orm/pg-core";

import { env } from "./env";
import * as schema from "./schema";

const primary = drizzle({
  connection: env.PRIMARY_DATABASE_URL,
  casing: "snake_case",
  schema,
});
const read1 = drizzle({
  connection: env.READ_CLONE_DATABASE_URL,
  casing: "snake_case",
  schema,
});

export const db: NodePgDatabase<typeof schema> = withReplicas(primary, [read1]);
