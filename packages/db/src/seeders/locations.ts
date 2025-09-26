import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import {
  address,
  camp,
  campHistory,
  location,
  organization,
  territory,
  user,
} from "../schema";
import * as auth from "../schematics/auth-schema";
import * as locations from "../schematics/locations";
import { STATE_CODES_TO_NAMES } from "../utils/staticFields";

async function main() {
  const url = process.env.PRIMARY_DATABASE_URL ?? "";

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    organization,
    user,
    address,
    location,
    territory,
    camp,
    campHistory,
  });

  await seed(db, {
    organization: auth.organization,
    user: auth.user,
    address: locations.address,
    location: locations.location,
    territory: locations.territory,
    camp: locations.camp,
    campHistory: locations.campHistory,
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
    territory: {
      columns: {
        name: f.valuesFromArray({
          values: ["North", "South", "East", "West"],
        }),
        color: f.default({ defaultValue: "#000" }),
        polygon: f.default({ defaultValue: {} }),
        active: f.default({ defaultValue: true }),
      },
    },
    camp: {
      columns: {
        name: f.valuesFromArray({
          values: ["Spring Camp", "Summer Camp", "Fall Camp", "Winter Camp"],
        }),
        address: f.default({ defaultValue: null }),
        startDate: f.date(),
        endDate: f.date(),
        partnerDealer: f.valuesFromArray({
          values: ["Evo", "Rome", "SafeStreets", "Super Sellers Supreme"],
        }),
      },
    },
    campHistory: {
      columns: {
        dateTime: f.default({ defaultValue: new Date() }),
        campName: f.valuesFromArray({
          values: [
            "Camp 1",
            "John Tech's Camp",
            "Campius Maximus",
            "The Camp that Could",
          ],
        }),
        fieldChanged: f.valuesFromArray({
          values: ["name", "address", "startDate", "endDate"],
        }),
        oldValue: f.default({ defaultValue: "old test" }),
        newValue: f.default({ defaultValue: "new test" }),
      },
    },
  }));

  console.log("locations seeded");
}

await main();
