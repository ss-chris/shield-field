import type { Config } from "drizzle-kit";

if (!process.env.PRIMARY_DATABASE_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const nonPoolingUrl = process.env.PRIMARY_DATABASE_URL;

export default {
  schema: "./src/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
} satisfies Config;
