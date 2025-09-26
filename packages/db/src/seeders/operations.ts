import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import { env } from "~/env";
import { organization, user, workOrder, workOrderHistory } from "~/schema";
import * as auth from "~/schematics/auth-schema";
import * as operations from "~/schematics/operations";

async function main() {
  const url = env.PRIMARY_DATABASE_URL;

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    organization,
    user,
    workOrder,
    workOrderHistory,
  });

  await seed(db, {
    organization: auth.organization,
    user: auth.user,
    workOrder: operations.workOrder,
    workOrderHistory: operations.workOrderHistory,
  }).refine((f) => ({
    user: {
      columns: {
        id: f.uuid(),
        name: f.fullName(),
        email: f.email(),
        emailVerified: f.default({ defaultValue: true }),
        image: f.default({ defaultValue: null }),
      },
    },
    organization: {
      columns: {
        id: f.uuid(),
        defaultSchedulingPolicyId: undefined,
        name: f.default({ defaultValue: "SafeStreets" }),
        slug: f.default({ defaultValue: "safestreets" }),
        logo: f.default({
          defaultValue: [
            "https://scontent-den2-1.xx.fbcdn.net/v/t39.30808-6/300744613_404486001792431_5961725451854351647_n.png?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=cLeCdGh92zoQ7kNvwF-lpCe&_nc_oc=Admj2MkRDVUPSe4Sbro-oImuIszOZdQi-hsLCbFGh0eJgsp1W1F8SN2cpIiO9p1rh5E&_nc_zt=23&_nc_ht=scontent-den2-1.xx&_nc_gid=X3LdMJOIctvLhiUjOy0tLw&oh=00_AfYMTT_MW_sHZM4VdLJeOSNT4mHCTRC9AeWjzMHOHAqWHQ&oe=68DB82D4",
          ],
        }),
      },
      count: 1,
    },
    workOrder: {
      columns: {
        type: f.valuesFromArray({
          values: ["service", "installation"],
        }),
        status: f.valuesFromArray({
          values: ["open", "in progress", "complete"],
        }),
        source: f.valuesFromArray({
          values: ["client", "shnield fjield", "aliens"],
        }),
        sourceDate: f.default({ defaultValue: new Date() }),
        calculatedDuration: f.default({ defaultValue: 240 }),
        totalTimeWorked: f.int({ minValue: 0, maxValue: 240 }),
        salesNote: f.default({ defaultValue: null }),
        techNote: f.default({ defaultValue: null }),
        navigationNote: f.default({ defaultValue: null }),
      },
    },
    workOrderHistory: {
      columns: {
        dateTime: f.default({ defaultValue: new Date() }),
        fieldChanged: f.valuesFromArray({
          values: ["status", "userId", "type"],
        }),
        oldValue: f.default({ defaultValue: "old test" }),
        newValue: f.default({ defaultValue: "new test" }),
      },
    },
  }));

  console.log("operations seeded");
}

await main();
