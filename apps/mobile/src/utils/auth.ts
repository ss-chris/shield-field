import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { ssoClient } from "@better-auth/sso/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getBaseUrl } from "./baseURL";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    expoClient({
      scheme: "shieldfield",
      storagePrefix: "shieldfield",
      storage: SecureStore,
    }),
    organizationClient(),
    ssoClient(),
  ],
});
