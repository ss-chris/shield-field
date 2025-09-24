import type { Config } from "drizzle-kit";

if (!process.env.PRIMARY_DATABASE_URL) {
  throw new Error("Missing PRIMARY_DATABASE_URL");
}

const nonPoolingUrl = process.env.PRIMARY_DATABASE_URL;

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
  tablesFilter: ["!pg_stat_*"],
} satisfies Config;
