import baseConfig from "@safestreets/eslint-config/base";
import reactConfig from "@safestreets/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
