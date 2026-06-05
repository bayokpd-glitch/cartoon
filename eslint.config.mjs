import {config as remotion} from "@remotion/eslint-config-flat";

export default [
  ...remotion,
  {
    ignores: ["dist/**", "build/**", "node_modules/**"],
  },
];
