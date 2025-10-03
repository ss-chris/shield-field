import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { sso } from "@better-auth/sso";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, organization } from "better-auth/plugins";

import { db } from "@safestreets/db/client";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  microsoftClientId: string;
  microsoftClientSecret: string;
  microsoftTenantId: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
      organization(),
      sso(),
    ],
    socialProviders: {
      microsoft: {
        clientId: options.microsoftClientId,
        clientSecret: options.microsoftClientSecret,
        tenantId: options.microsoftTenantId,
        redirectURI: `${options.productionUrl}/api/auth/callback/microsoft`,
        prompt: "select_account",
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    trustedOrigins: [
      "exp://",
      "expo://",
      "shieldfield://",
      "http://localhost:5173",
    ],
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
