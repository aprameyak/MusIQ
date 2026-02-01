module.exports = {
  root: true,
  ignorePatterns: [
    "**/dist/**",
    "**/node_modules/**",
    "**/.next/**",
    "**/coverage/**",
    "**/combined.log",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
  settings: {
    next: {
      rootDir: ["backend/", "webapp/", "etl/"],
    },
  },
};
