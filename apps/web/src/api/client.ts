import { hcWithType } from "@safestreets/api";

export const client = hcWithType("http://localhost:3000", {
  init: {
    credentials: "include",
  },
});