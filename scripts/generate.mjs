import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { routes } from "../src/data/routes.mjs";
import { renderPage } from "../src/templates/site.mjs";

for (const route of routes) {
  const directory = join(process.cwd(), route.path);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), renderPage(route));
}
console.log(`${routes.length}ページのHTMLを生成しました。`);
