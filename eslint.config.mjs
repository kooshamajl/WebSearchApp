import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
    {
        files: ["**/*.{ts,tsx}", "eslint.config.mjs"],
        extends: [js.configs.recommended],
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false,
                    configFile: false,
                    parserOpts: { plugins: ["typescript", "jsx"] },
                },
            },
        },
        rules: {
            // TypeScript checks names and unused declarations, including type-only symbols.
            "no-undef": "off",
            "no-unused-vars": "off",
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: { "react-hooks": reactHooks },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
        },
    },
);
