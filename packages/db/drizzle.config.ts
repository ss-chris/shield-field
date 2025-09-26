import type { Config } from "drizzle-kit";

const connectionURL = process.env.PRIMARY_DATABASE_URL;

if (!connectionURL) {
  throw new Error("Missing PRIMARY_DATABASE_URL");
}

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: connectionURL },
  casing: "snake_case",
  tablesFilter: ["!pg_stat_*"],
} satisfies Config;
