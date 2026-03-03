import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["public/**/*.js", "src/**/*.js"],
      exclude: ["**/*.test.js", "public/main.js"],
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    }
  }
});
