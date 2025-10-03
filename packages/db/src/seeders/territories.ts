import { db } from "~/client";
import territories from "~/resources/salesforceTerritories.json";
import * as schema from "~/schema";

const usersResult = await db.select().from(schema.user).limit(1);
const orgsResult = await db.select().from(schema.organization).limit(1);

if (!usersResult.length || !orgsResult.length) {
  throw new Error("users or orgs result empty");
}

const user = usersResult.at(0);
const org = orgsResult.at(0);

if (!user || !org) {
  throw new Error("users or orgs undefined");
}

const insertResult = await db.insert(schema.territory).values(
  territories.map((territory) => ({
    name: territory.name,
    managerId: user.id,
    organizationId: org.id,
    polygon: territory.convertedGeoJSON,
  })),
);

console.log(insertResult);
