import { QueryClient } from "@tanstack/react-query";

import { hcWithType } from "@safestreets/api/client";

import { getBaseUrl } from "./baseURL";

export const apiClient = hcWithType(getBaseUrl(), {});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});
