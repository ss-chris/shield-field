import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import { env } from "~/env";
import {
  address,
  appointment,
  arrivalWindowTemplate,
  customer,
  location,
  operatingHoursPolicy,
  operatingHoursPolicyRule,
  organization,
  schedulingPolicy,
  user,
  workOrder,
} from "~/schema";
import * as auth from "~/schematics/auth";
import * as locations from "~/schematics/locations";
import * as operations from "~/schematics/operations";
import * as scheduling from "~/schematics/scheduling";
import { STATE_CODES_TO_NAMES } from "~/utils/staticFields";

async function main() {
  const url = env.PRIMARY_DATABASE_URL;

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    organization,
    arrivalWindowTemplate,
    operatingHoursPolicy,
    operatingHoursPolicyRule,
    schedulingPolicy,
    appointment,
    customer,
    workOrder,
    location,
    address,
    user,
  });

  await seed(db, {
    organization: auth.organization,
    arrivalWindowTemplate: scheduling.arrivalWindowTemplate,
    operatingHoursPolicy: scheduling.operatingHoursPolicy,
    operatingHoursPolicyRule: scheduling.operatingHoursPolicyRule,
    schedulingPolicy: scheduling.schedulingPolicy,
    appointment: scheduling.appointment,
    customer: operations.customer,
    workOrder: operations.workOrder,
    location: locations.location,
    address: locations.address,
    user: auth.user,
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
    address: {
      columns: {
        line1: f.streetAddress(),
        line2: f.valuesFromArray({
          values: ["STE", "APT", "BLD"],
        }),
        line3: f.int({ minValue: 1, maxValue: 30 }),
        city: f.city(),
        state: f.state(),
        stateCode: f.valuesFromArray({
          values: Object.keys(STATE_CODES_TO_NAMES),
        }),
        zip: f.postcode(),
        county: f.valuesFromArray({
          values: Object.values(STATE_CODES_TO_NAMES).map((t) => t + " County"),
        }),
      },
    },
    location: {
      columns: {
        name: f.valuesFromArray({
          values: ["Main Office", "Warehouse 17", "Service Center"],
        }),
        addressId: f.int({ minValue: 1, maxValue: 10 }),
      },
    },
    user: {
      columns: {
        id: f.uuid(),
        name: f.fullName(),
        email: f.email(),
        emailVerified: f.default({ defaultValue: true }),
        image: f.default({ defaultValue: null }),
      },
    },
    arrivalWindowTemplate: {
      columns: {
        name: f.valuesFromArray({
          values: ["2-Hour Slots", "4-Hour Slots", "All Day"],
        }),
        durationMinutes: f.valuesFromArray({
          values: [120, 240],
        }),
        stepMinutes: f.valuesFromArray({
          values: [60, 120],
        }),
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
    customer: {
      columns: {
        externalId: f.uuid(),
        confirmationNumber: f.int({ minValue: 11111, maxValue: 99999 }),
        status: f.valuesFromArray({
          values: operations.customerStatusEnum.enumValues,
        }),
        source: f.default({ defaultValue: "SafeStreets" }),
        sourceDate: f.date(),
        soldById: f.uuid(),
        installDate: f.date(),
      },
    },
    workOrder: {
      columns: {
        type: f.valuesFromArray({
          values: operations.workOrderTypeEnum.enumValues,
        }),
        status: f.valuesFromArray({
          values: operations.workOrderStatusEnum.enumValues,
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
    appointment: {
      columns: {
        externalId: f.uuid(),
        status: f.valuesFromArray({
          values: scheduling.appointmentStatusEnum.enumValues,
        }),
      },
    },
  }));

  console.log("scheduling seeded");
}

await main();
