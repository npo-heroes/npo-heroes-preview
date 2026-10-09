import { defineConfig } from "vite";
import { resolve } from "node:path";
import { routes, base } from "./src/data/routes.mjs";

export default defineConfig({
  base,
  build: {
    rolldownOptions: {
      input: Object.fromEntries(
        routes.map((route) => [
          route.key,
          resolve("." + route.path, "index.html"),
        ]),
      ),
    },
  },
});
