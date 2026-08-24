// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angularEslint = require("@angular-eslint/eslint-plugin");
const angularTemplate = require("@angular-eslint/eslint-plugin-template");
const templateParser = require("@angular-eslint/template-parser");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    plugins: {
      "@angular-eslint": angularEslint,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-underscore-dangle": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-assignment": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-case-declarations": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",

      "@angular-eslint/contextual-decorator": "error",
      "@angular-eslint/contextual-lifecycle": "error",
      "@angular-eslint/no-async-lifecycle-method": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-pipe-impure": "error",
      "@angular-eslint/no-forward-ref": "error",
      "@angular-eslint/no-attribute-decorator": "error",
      "@angular-eslint/require-lifecycle-on-prototype": "error",
      "@angular-eslint/use-lifecycle-interface": "warn",
      "@angular-eslint/prefer-inject": "warn",
      "@angular-eslint/no-implicit-take-until-destroyed": "warn",
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
    rules: {
      "@angular-eslint/template/eqeqeq": ["error", { allowNullOrUndefined: true }],
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/no-any": "warn",
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/no-autofocus": "error",
      "@angular-eslint/template/no-positive-tabindex": "error",
      "@angular-eslint/template/alt-text": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/mouse-events-have-key-events": "error",
      "@angular-eslint/template/no-distracting-elements": "error",
      "@angular-eslint/template/table-scope": "error",
      "@angular-eslint/template/role-has-required-aria": "error",
      "@angular-eslint/template/no-duplicate-attributes": "error",
      "@angular-eslint/template/elements-content": "error",
      "@angular-eslint/template/no-empty-control-flow": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "projects/**"],
  }
);
