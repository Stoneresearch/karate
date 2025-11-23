// import { dirname } from "path";
// import { fileURLToPath } from "url";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


const eslintConfig = [
  {
    ignores: [".next/", "node_modules/", "dist/", "build/"],
  },
  js.configs.recommended,
  {
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ...reactPlugin.configs.flat["jsx-runtime"],
  },
  {
    plugins: {
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];

export default eslintConfig;
