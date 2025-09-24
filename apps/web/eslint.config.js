import baseConfig, {
  restrictEnvAccess,
} from "@safestreets/eslint-config/base";
import nextjsConfig from "@safestreets/eslint-config/nextjs";
import reactConfig from "@safestreets/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
