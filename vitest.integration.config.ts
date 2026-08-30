import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["**/__tests__/**/*.integration.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    setupFiles: ["./tests/load-env.ts"],
    testTimeout: 30_000,
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/server-only-stub.ts", import.meta.url),
      ),
    },
  },
});
