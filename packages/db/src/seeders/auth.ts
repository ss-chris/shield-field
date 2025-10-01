import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import { env } from "~/env";
import {
  account,
  invitation,
  member,
  organization,
  session,
  ssoProvider,
  user,
  verification,
} from "~/schema";
import * as auth from "~/schematics/auth";

async function main() {
  const url = env.PRIMARY_DATABASE_URL;

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {
    user,
    session,
    account,
    verification,
    organization,
    member,
    invitation,
    ssoProvider,
  });

  await seed(db, {
    user: auth.user,
    session: auth.session,
    account: auth.account,
    verification: auth.verification,
    organization: auth.organization,
    member: auth.member,
    invitation: auth.invitation,
    ssoProvider: auth.ssoProvider,
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
    session: {
      columns: {
        id: f.uuid(),
        expiresAt: f.default({
          defaultValue: new Date(Date.now() + 86400000),
        }),
        token: f.uuid(),
        ipAddress: f.default({ defaultValue: "178.156.149.169" }),
        userAgent: f.uuid(),
        activeOrganizationId: f.uuid(),
      },
    },
    account: {
      columns: {
        id: f.uuid(),
        accountId: f.uuid(),
        providerId: f.valuesFromArray({
          values: ["google", "email"],
        }),
        accessToken: f.uuid(),
        refreshToken: f.uuid(),
        idToken: f.uuid(),
        accessTokenExpiresAt: f.default({
          defaultValue: new Date(Date.now() + 604800000),
        }),
        refreshTokenExpiresAt: f.default({
          defaultValue: new Date(Date.now() + 604800000),
        }),
        scope: f.default({ defaultValue: null }),
        password: f.default({ defaultValue: "Password1!" }),
      },
    },
    verification: {
      columns: {
        id: f.uuid(),
        identifier: f.email(),
        value: f.uuid(),
        expiresAt: f.default({
          defaultValue: new Date(Date.now() + 3600000),
        }),
      },
    },
    member: {
      columns: {
        id: f.uuid(),
        role: f.default({ defaultValue: "member" }),
      },
    },
    invitation: {
      columns: {
        id: f.uuid(),
        email: f.email(),
        role: f.default({ defaultValue: null }),
        status: f.default({ defaultValue: "pending" }),
        expiresAt: f.default({
          defaultValue: new Date(Date.now() + 604800000),
        }),
      },
    },
    ssoProvider: {
      columns: {
        id: f.uuid(),
        issuer: f.valuesFromArray({
          values: ["microsoft", "apple"],
        }),
        oidcConfig: f.default({ defaultValue: null }),
        samlConfig: f.default({ defaultValue: null }),
        providerId: f.uuid(),
        organizationId: f.uuid(),
        domain: f.valuesFromArray({
          values: ["microsoft.com", "apple.com"],
        }),
      },
    },
  }));

  console.log("auth seeded");
}

await main();
