import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { routes, base, articlePath, href } from "../src/data/routes.mjs";
import { renderPage } from "../src/templates/site.mjs";
import { matchesNews } from "../src/search.ts";

const outputs = routes.map((route) => ({ route, html: renderPage(route) }));

test("8ページの内部リンクが公開用ベースパスと実在するページを参照する", () => {
  assert.equal(routes.length, 8);
  const paths = new Set(routes.map((route) => href(route.path)));
  for (const { html } of outputs) {
    for (const [, target] of html.matchAll(/href="([^"]+)"/g)) {
      if (target.startsWith(base) && !target.includes("/images/"))
        assert.ok(paths.has(target), target);
    }
  }
  assert.ok(paths.has(href(articlePath)));
});

test("全ページの画像と共有フォントが存在し、画像のloading属性は重複しない", () => {
  for (const { html } of outputs) {
    for (const [tag, src] of html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)) {
      assert.ok(existsSync(`public${src}`), src);
      assert.equal((tag.match(/loading=/g) ?? []).length, 1);
    }
  }
  for (const font of ["noto-regular.woff2", "noto-bold.woff2", "sura-bold.ttf"])
    assert.ok(existsSync(`public/fonts/${font}`));
});

test("大樹生命の正しい遷移先・別タブ属性を維持する", () => {
  assert.match(
    outputs[0].html,
    /href="https:\/\/www\.taiju-life\.co\.jp" target="_blank" rel="noopener noreferrer"/,
  );
});

test("問い合わせはメール導線だけ、全ページを検索対象外にする", () => {
  const contact = outputs.find(({ route }) => route.key === "contact").html;
  assert.match(contact, /mailto:contact@npo-heroes\.com/);
  assert.doesNotMatch(contact, /<form/);
  for (const { html } of outputs)
    assert.match(html, /name="robots" content="noindex,nofollow"/);
});

test("カテゴリ・年月・複数キーワードをAND検索し全角英数字も一致する", () => {
  const item = {
    category: "ヒーローズカップ",
    month: "2026.08",
    text: "The 18th HEROES CUP 開催のお知らせ",
  };
  assert.ok(matchesNews(item, { category: "", month: "", keyword: "" }));
  assert.ok(
    matchesNews(item, {
      category: "ヒーローズカップ",
      month: "2026.08",
      keyword: "ＨＥＲＯＥＳ  開催",
    }),
  );
  assert.ok(
    !matchesNews(item, { category: "ラガール", month: "", keyword: "" }),
  );
  assert.ok(
    !matchesNews(item, { category: "", month: "2026.01", keyword: "" }),
  );
  assert.ok(
    !matchesNews(item, { category: "", month: "", keyword: "heroes 未登録" }),
  );
});
