import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { routes, base, articlePath, href } from "../src/data/routes.mjs";
import { content, renderPage } from "../src/templates/site.mjs";
import { matchesNews } from "../src/search.ts";

const outputs = routes.map((route) => ({ route, html: renderPage(route) }));

test("8ページの内部リンクが公開用ベースパスと実在するページを参照する", () => {
  assert.equal(routes.length, 8);
  const paths = new Set(routes.map((route) => href(route.path)));
  for (const { html } of outputs) {
    for (const [, target] of html.matchAll(/href="([^"]+)"/g)) {
      if (target.startsWith(base) && !target.includes("/images/"))
        assert.ok(
          paths.has(
            decodeURIComponent(
              new URL(target, "https://example.test").pathname,
            ),
          ),
          target,
        );
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

test("全ページから寄付プランへ移動でき、未確定ボタンと確認用ダイアログはない", () => {
  for (const { html } of outputs) {
    assert.match(html, /href="\/npo-heroes-preview\/cheers\/#donation-plans"/);
    assert.doesNotMatch(html, /data-preview=|<dialog/);
    assert.match(
      html,
      /aria-label="メインナビゲーション"><a href="\/npo-heroes-preview\/">TOP<\/a>/,
    );
  }
  assert.match(
    outputs.find(({ route }) => route.key === "cheers").html,
    /id="donation-plans"/,
  );
  const news = outputs.find(({ route }) => route.key === "news").html;
  assert.doesNotMatch(news, /<button[^>]*data-news-row/);
  assert.doesNotMatch(news, /more-news/);
});

test("記事タグから選択したカテゴリを指定して一覧へ移動できる", () => {
  const article = outputs.find(({ route }) => route.key === "article").html;
  const links = [...article.matchAll(/class="news-tag" href="([^"]+)"/g)].map(
    ([, target]) => new URL(target, "https://example.test"),
  );
  assert.deepEqual(
    links.map((url) => url.searchParams.get("category")),
    ["お知らせ", "ヒーローズカップ"],
  );
  assert.ok(links.every((url) => url.pathname === href("/news/")));
});

test("トップのバッジはカードの位置ではなく記事のタグから決まる", () => {
  const original = content.top.news;
  try {
    content.top.news = [
      { ...original[3], tags: "お知らせ, ラガール, ヒーローズカップ" },
      { ...original[0], tags: "#お知らせ #ヒーローズカップ" },
      { ...original[1], tags: "ラグビーフェスティバル，お知らせ" },
      { ...original[2], tags: "未登録のタグ" },
    ];
    const top = renderPage(routes.find((route) => route.key === "top"));
    assert.deepEqual(
      [...top.matchAll(/class="news-badge news-badge-([^"]+)">([^<]+)</g)].map(
        ([, style, label]) => [style, label],
      ),
      [
        ["rugirl", "ラガール"],
        ["cup", "ヒーローズカップ"],
        ["festival", "ラグビーフェスティバル"],
      ],
    );
  } finally {
    content.top.news = original;
  }
});

test("トップのカンマ区切りのタグは1つずつカテゴリの絞り込みへ接続する", () => {
  const top = outputs.find(({ route }) => route.key === "top").html;
  const links = [...top.matchAll(/class="news-tag" href="([^"]+)"/g)].map(
    ([, target]) => new URL(target, "https://example.test"),
  );
  assert.deepEqual(
    links.map((url) => url.searchParams.get("category")),
    [
      "お知らせ",
      "ヒーローズカップ",
      "お知らせ",
      "ヒーローズカップ",
      "お知らせ",
      "ヒーローズカップ",
      "お知らせ",
      "ラガール",
    ],
  );
});

test("全8ページの問い合わせ下に5種類のSNSを表示し未確定URLへ誘導しない", () => {
  for (const { html } of outputs) {
    const social = html.match(/class="social-links"[^>]*>(.*?)<\/div>/s)?.[1];
    assert.ok(social);
    assert.deepEqual(
      [...social.matchAll(/role="img" aria-label="([^"]+)"/g)].map(
        ([, label]) => label,
      ),
      ["LINE", "Instagram", "Facebook", "YouTube", "X"],
    );
    assert.doesNotMatch(social, /<a\b|<button\b|tabindex/);
    assert.match(
      html,
      /footer-contact.*?お問い合わせ<\/a><div class="social-links"/s,
    );
  }
});

test("実績の数字だけを強調し、TOPのパンくずを現在地として示す", () => {
  const top = outputs.find(({ route }) => route.key === "top").html;
  assert.match(top, /class="record-value">のべ<strong>3,729<\/strong>チーム/);
  assert.match(top, /class="record-value"><strong>1,327<\/strong>人/);
  assert.match(
    top,
    /aria-label="パンくず"><span aria-current="page">TOP<\/span>/,
  );
});

test("活動写真列には停止操作があり、繰り返し部分を読み上げ対象から外す", () => {
  for (const key of ["mission", "cheers", "partners"]) {
    const html = outputs.find(({ route }) => route.key === key).html;
    assert.equal([...html.matchAll(/class="mosaic-track"/g)].length, 3);
    assert.equal(
      [...html.matchAll(/class="mosaic-group" aria-hidden="true"/g)].length,
      9,
    );
    assert.match(
      html,
      /class="mosaic-toggle" type="button" aria-pressed="false"/,
    );
  }
});

test("役員写真の切り抜きで元画像の縦横比を保つ", () => {
  const person = content.about.people.find(
    (person) => person.name.trim() === "山田 寛",
  );
  // FigmaのSTRETCH変換を直接掛けると縦長になる画像を回帰確認する。
  const originalRatio = 1258 / 1302;
  assert.ok(
    Math.abs(person.crop.width / person.crop.height - originalRatio) < 0.002,
  );
});
