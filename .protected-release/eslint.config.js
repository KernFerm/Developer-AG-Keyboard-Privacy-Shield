const globals = require("globals");

module.exports = [
  {
    ignores: [".protected-release/**", "dist/**", "node_modules/**"]
  },
  {
    files: ["src/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-eval": "error"
    }
  }
];
