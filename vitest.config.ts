import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "components/**/*.{ts,tsx}",
        "constants/**/*.ts",
        "lib/**/*.ts",
        "store/**/*.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}"],
    },
    projects: [
      {
        resolve: {
          alias: { "@": dirname },
          // Deduplicate React so all packages (e.g. Radix UI) share the same instance.
          // Without this, pnpm's isolated node_modules can give each package its own
          // React copy, causing "Invalid hook call" errors in jsdom component tests.
          dedupe: ["react", "react-dom"],
        },
        test: {
          name: "unit",
          environment: "node",
          setupFiles: ["./test/setup-dom.ts"],
          include: [
            "app/**/*.test.{ts,tsx}",
            "components/**/*.test.{ts,tsx}",
            "constants/**/*.test.ts",
            "lib/**/*.test.ts",
            "store/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
