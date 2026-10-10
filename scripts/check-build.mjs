import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routes, base } from "../src/data/routes.mjs";

for (const route of routes) {
  const path = join("dist", route.path, "index.html");
  const html = readFileSync(path, "utf8");
  assert.ok(
    !html.includes(base + base.slice(1)),
    `${path}: ベースパスが重複しています`,
  );
  for (const [, url] of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    if (!url.startsWith("/")) continue;
    assert.ok(
      url.startsWith(base),
      `${path}: 公開用ベースパスがありません: ${url}`,
    );
    const asset = decodeURIComponent(
      new URL(url, "https://example.test").pathname,
    ).slice(base.length);
    const target = join(
      "dist",
      asset.endsWith("/") || !asset ? `${asset}index.html` : asset,
    );
    assert.ok(existsSync(target), `${path}: リンク先がありません: ${url}`);
  }
}
assert.ok(!existsSync("dist/docs"), "設計文書は配信対象に含めません");
console.log("8ページのビルド後の内部リンク・画像・CSS・JSを確認しました。");
