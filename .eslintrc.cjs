module.exports = {
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": ["error"],
    eqeqeq: ["error", "smart"],
  },
  root: true,
}
