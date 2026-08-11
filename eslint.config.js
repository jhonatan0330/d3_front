// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
      "no-underscore-dangle": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-assignment": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-case-declarations": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "projects/**", "src/@fuse/**"],
  }
);
