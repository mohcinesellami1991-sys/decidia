import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/unit/**/*.test.ts"] },
  resolve: { alias: { "server-only": new URL("./tests/unit/server-only-stub.ts", import.meta.url).pathname } },
});
