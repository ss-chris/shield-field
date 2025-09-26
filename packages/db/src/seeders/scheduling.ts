import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import {
  arrivalWindowTemplate,
  operatingHoursPolicy,
  operatingHoursPolicyRule,
  organization,
  schedulingPolicy,
} from "../schema";
import * as auth from "../schematics/auth-schema";
import * as scheduling from "../schematics/scheduling";

async function main() {
  const url = process.env.PRIMARY_DATABASE_URL ?? "";

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    organization,
    arrivalWindowTemplate,
    operatingHoursPolicy,
    operatingHoursPolicyRule,
    schedulingPolicy,
  });

  await seed(db, {
    organization: auth.organization,
    arrivalWindowTemplate: scheduling.arrivalWindowTemplate,
    operatingHoursPolicy: scheduling.operatingHoursPolicy,
    operatingHoursPolicyRule: scheduling.operatingHoursPolicyRule,
    schedulingPolicy: scheduling.schedulingPolicy,
  }).refine((f) => ({
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
    arrivalWindowTemplate: {
      columns: {
        name: f.valuesFromArray({
          values: ["2-Hour Slots", "4-Hour Slots", "All Day"],
        }),
        durationMinutes: f.int({ minValue: 120, maxValue: 240 }),
        stepMinutes: f.int({ minValue: 60, maxValue: 120 }),
      },
    },
    operatingHoursPolicy: {
      columns: {
        name: f.valuesFromArray({
          values: ["Standard Hours", "Extended Hours", "Evo Hours"],
        }),
      },
    },
    operatingHoursPolicyRule: {
      columns: {
        dayOfWeek: f.int({ minValue: 1, maxValue: 7 }),
        openTime: f.valuesFromArray({
          values: ["08:00:00", "09:00:00"],
        }),
        closeTime: f.valuesFromArray({
          values: ["17:00:00", "18:00:00"],
        }),
        earliestLeaveHomeTime: f.valuesFromArray({
          values: ["07:00:00", "08:00:00"],
        }),
        latestReturnHomeTime: f.valuesFromArray({
          values: ["18:00:00", "19:00:00"],
        }),
      },
    },
    schedulingPolicy: {
      columns: {
        name: f.valuesFromArray({
          values: ["Standard Policy", "Premium Policy", "Basic Policy"],
        }),
      },
    },
  }));

  console.log("scheduling seeded");
}

await main();
