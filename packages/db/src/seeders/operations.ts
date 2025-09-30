import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import { env } from "~/env";
import {
  address,
  customer,
  location,
  organization,
  product,
  user,
  workOrder,
  workOrderHistory,
  workOrderLineItem,
} from "~/schema";
import * as auth from "~/schematics/auth-schema";
import * as inventory from "~/schematics/inventory";
import * as locations from "~/schematics/locations";
import * as operations from "~/schematics/operations";
import { STATE_CODES_TO_NAMES } from "~/utils/staticFields";

async function main() {
  const url = env.PRIMARY_DATABASE_URL;

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    organization,
    user,
    workOrder,
    workOrderHistory,
    customer,
    workOrderLineItem,
    product,
    location,
    address,
  });

  await seed(db, {
    organization: auth.organization,
    user: auth.user,
    workOrder: operations.workOrder,
    workOrderHistory: operations.workOrderHistory,
    customer: operations.customer,
    workOrderLineItem: operations.workOrderLineItem,
    product: inventory.product,
    location: locations.location,
    address: locations.address,
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
    product: {
      columns: {
        externalId: f.uuid(),
        name: f.valuesFromArray({
          values: ["camera", "doorbell", "sensor"],
        }),
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
    workOrderLineItem: {
      columns: {
        status: f.valuesFromArray({
          values: operations.workOrderLineItemStatusEnum.enumValues,
        }),
        confirmationStatus: f.valuesFromArray({
          values: operations.workOrderLineItemConfirmationStatusEnum.enumValues,
        }),
        quantity: f.int({ minValue: 1, maxValue: 5 }),
        soldById: f.uuid(),
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
