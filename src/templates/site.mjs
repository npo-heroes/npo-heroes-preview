import { readFileSync } from "node:fs";
import { routes, href, articlePath, base } from "../data/routes.mjs";
export const content = JSON.parse(
  readFileSync(new URL("../data/content.json", import.meta.url), "utf8"),
);
export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const e = escapeHtml;
const br = (value) => e(value).replace(/\r\n|[\n\u2028\u2029]/g, "<br>");
const image = (src, alt = "", attrs = "") =>
  `<img src="/${src}" alt="${e(alt)}" ${attrs.includes("loading=") ? "" : 'loading="lazy"'} decoding="async" ${attrs}>`;
const link = (label, path, color = "gold") =>
  `<a class="button ${color}" href="${href(path)}"><span aria-hidden="true">›</span>${e(label)}</a>`;
const notice = (label, color = "gold", kind = "page") =>
  `<button class="button ${color}" type="button" data-preview="${kind}"><span aria-hidden="true">›</span>${e(label)}</button>`;
const heading = (jp, en, color = "gold", level = "h2") =>
  `<div class="section-heading ${color}-text"><${level}>${e(jp)}</${level}><p lang="en">${e(en)}</p></div>`;
const navItems = routes.filter((r) =>
  ["mission", "about", "cheers", "partners", "news"].includes(r.key),
);
const competitions = `<a href="https://heroes-cup.com/" target="_blank" rel="noopener noreferrer">ヒーローズカップ</a><a href="https://heroes-cup.com/frf/" target="_blank" rel="noopener noreferrer">ラグビーフェスティバル</a><button type="button" data-preview="page">ラガールキャンプ</button>`;
function header() {
  const nav = navItems.map(
    (r) =>
      `<a href="${href(r.path)}">${r.key === "news" ? "お知らせ" : r.title}</a>`,
  );
  return `<a class="skip-link" href="#main">本文へ移動</a><header class="site-header"><a class="brand" href="${href("/")}" aria-label="NPO HEROES トップ">${image(content.logo, "NPO HEROES", 'loading="eager" width="179" height="56"')}</a><nav class="desktop-nav" aria-label="メインナビゲーション">${nav.slice(0, 4).join("")}<details class="competition-menu"><summary>各大会</summary><div>${competitions}</div></details>${nav[4]}</nav><div class="header-actions">${notice("寄付する", "green", "donation")}<a class="header-contact" href="${href("/contact-us/")}">お問い合わせ</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="メニューを開く"><span></span><span></span><span></span></button></div></header><nav id="mobile-menu" class="mobile-menu" aria-label="スマートフォンのナビゲーション" hidden>${nav.slice(0, 4).join("")}<details><summary>各大会</summary><div>${competitions}</div></details>${nav[4]}<a href="${href("/contact-us/")}">お問い合わせ</a></nav>`;
}
function social() {
  return `<div class="social-links" aria-label="SNS">${[
    ["LINE", "images/line.svg"],
    ["Instagram", content.social.instagram],
    ["Facebook", content.social.facebook],
    ["YouTube", "images/youtube.svg"],
    ["X", content.social.x],
  ]
    .map(
      ([name, src]) =>
        `<button type="button" data-preview="social" aria-label="${name}">${image(src, name, 'width="24" height="24"')}</button>`,
    )
    .join("")}</div>`;
}
function footer(route) {
  return `<footer class="site-footer"><div class="footer-inner"><nav class="breadcrumbs" aria-label="パンくず"><a href="${href("/")}">TOP</a>${route.key === "article" ? `<span aria-hidden="true">›</span><a href="${href("/news/")}">お知らせ一覧</a>` : ""}${route.key !== "top" ? `<span aria-hidden="true">›</span><span aria-current="page">${route.key === "article" ? "お知らせ" : e(route.title)}</span>` : ""}</nav><p class="organization">特定非営利活動法人ヒーローズ</p><address><p>〒561-0802 豊中市曽根東町2-1-6-202</p><p>TEL 06-6864-7311　/　FAX 06-6867-4433</p><p>Mail contact@npo-heroes.com</p></address><div class="footer-contact">${link("お問い合わせ", "/contact-us/")}${social()}</div><small>Copyright © NPO heroes</small></div></footer>`;
}
function hero(page, title) {
  const vars = ["Pc", "Sp"]
    .flatMap((kind) =>
      ["width", "height", "left", "top"].map(
        (key) =>
          "--" +
          kind.toLowerCase() +
          "-" +
          key +
          ":" +
          page["hero" + kind][key] +
          "%",
      ),
    )
    .join(";");
  return (
    '<section class="sub-hero"><picture><source media="(max-width:760px)" srcset="/' +
    page.heroSp.src +
    '">' +
    image(
      page.heroPc.src,
      "ラグビーを楽しむ子どもたち",
      'loading="eager" fetchpriority="high" style="' + vars + '"',
    ) +
    "</picture><h1>" +
    title +
    "</h1></section>"
  );
}
function intro(data) {
  const pc = data.introPc || data.intro;
  const sp = data.introSp || pc;
  return (
    '<section class="intro"><h2><span class="pc-copy">' +
    br(pc.heading) +
    '</span><span class="sp-copy">' +
    br(sp.heading) +
    '</span></h2><p><span class="pc-copy">' +
    br(pc.body) +
    '</span><span class="sp-copy">' +
    br(sp.body) +
    "</span></p></section>"
  );
}
function mosaic(rows) {
  return `<div class="photo-mosaic" aria-label="ヒーローズの活動風景">${rows.map((row) => `<div>${row.map((p) => image(p.src, "")).join("")}</div>`).join("")}</div>`;
}
function chapter(data, index) {
  return `<div class="chapter-banner chapter-${index}"><div>${image(data.image, "")}<h2>${br(data.title)}</h2></div></div>`;
}
function top() {
  const d = content.top;
  const sponsorNames = [
    "大樹生命",
    "三井住友銀行",
    "三菱地所",
    "大和ハウス",
    "ヒガシグループ",
  ];
  const sponsors = [
    "https://www.taiju-life.co.jp",
    "https://www.smbc.co.jp/",
    "https://www.mec.co.jp/",
    "https://www.daiwahouse.co.jp/",
    "https://www.e-higashi.co.jp/",
  ];
  return `
<section class="top-hero"><div class="hero-photo">${image(d.hero, "ボールを持って走るラグビー選手", 'loading="eager" fetchpriority="high"')}</div><div class="top-message"><h1 lang="en">NPO HEROES</h1><div class="rugby-lace" aria-hidden="true"></div><div class="top-message-copy"><h2>${e(d.heading)}</h2><p><span class="pc-copy">${br(d.intro)}</span><span class="sp-copy">${br(d.introSp)}</span></p>${link("私たちについて", "/mission/", "white")}</div></div></section>
<section class="top-news section-space">${heading("お知らせ", "What’s new?")}<div class="top-news-panel"><div class="news-cards">${d.news.map((n, i) => `<${i === 1 ? "a" : "button"} ${i === 1 ? `href="${href(articlePath)}"` : 'type="button" data-preview="article"'} class="news-card">${image(n.image, "")}<div class="news-card-copy"><span class="news-badge">${i === 3 ? "ラガール" : "ヒーローズカップ"}</span><h3>${e(n.title)}</h3><p>${e(n.tags)}</p><time>${e(n.date)}</time></div></${i === 1 ? "a" : "button"}>`).join("")}</div>${link("お知らせ一覧", "/news/")}</div></section>
<section class="activities section-space"><div class="activities-intro">${image(d.whatImage, "子どもたちがラグビーを楽しむ様子")}<h2 lang="en">What we do</h2><p class="activity-catch"><span>ラグビーとの出会い方は</span><span>ひとつではありません</span></p><p class="activity-description">${br(d.whatDescription)}</p></div><div class="activity-cards">${d.activities.map((a, i) => `<article class="activity-card activity-${i}"><div class="activity-photo">${image(a.image, "")}</div><div class="activity-copy"><h3 lang="en"><span class="pc-copy">${e(a.title)}</span><span class="sp-copy">${br(d.activitiesSp[i].title)}</span></h3><div class="activity-tags">${a.tags.map((t) => `<span>${e(t)}</span>`).join("")}</div><p>${br(a.description)}</p>${i < 2 ? `<a class="button ${i ? "gold" : "red"}" href="${i ? "https://heroes-cup.com/frf/" : "https://heroes-cup.com/"}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">›</span>もっと見る</a>` : notice("もっと見る", "pink")}</div></article>`).join("")}</div></section>
<section class="record section-space">${heading("数字でみるヒーローズ", "track record")}<div class="record-layout"><div class="record-content"><h3>${br(d.record.heading)}</h3><p>${br(d.record.body)}</p><div class="record-numbers">${d.record.items.map(([label, value, caption], i) => `<div>${image("images/" + ["rugby", "people", "smile", "flower"][i] + "-icon.svg", "", 'class="record-symbol"')}<h4>${br(label)}</h4><strong>${e(value)}</strong><p>${br(caption)}</p></div>`).join("")}</div></div>${image("images/japan-map.svg", "47都道府県 全国大会参加中！", 'class="japan-map"')}</div></section>
<section class="schedule section-space">${heading("2026年度スケジュール", "Event Schedule", "green")}<div class="schedule-goal" aria-hidden="true"></div><div class="schedule-rows">${d.schedule.map((s) => `<div class="schedule-row"><div class="schedule-date">${s.year ? `<strong>${s.year}</strong>` : ""}<p><span class="pc-copy">${br(s.date)}</span><span class="sp-copy">${br(s.dateSp)}</span></p></div><div class="schedule-description"><span class="schedule-category ${s.category === "ヒーローズカップ" ? "cup" : s.category === "ラガールキャンプ" ? "camp" : "festival"}">${e(s.category)}</span><h3>${e(s.title)}</h3><p>${e(s.place)}</p></div></div>`).join("")}</div></section>
<section id="supporters" class="supporters section-space">${heading("サポーターの皆様", "Supporter", "red")}<div class="supporter-panel"><div class="sponsor-list">${d.sponsors.map((s, i) => `<a href="${sponsors[i]}" target="_blank" rel="noopener noreferrer" aria-label="${sponsorNames[i]} 公式サイト(新しいタブ)">${image(s.image, sponsorNames[i], `width="${s.width}" height="${s.height}" style="--logo-width:${s.width}px;--mobile-logo-width:${[135, 105, 148, 212, 146][i]}px;--mobile-logo-height:${i === 1 ? 38 : 44}px"`)}</a>`).join("")}</div>${link("企業・団体の皆様へ", "/partners/", "red")}</div></section>`;
}
function mission() {
  const d = content.mission;
  return `${hero(d, "私たちについて")}${intro(d)}${mosaic(d.mosaic)}<section class="mission-issues">${chapter(d.chapters[0], 0)}<div class="issue-cards">${d.issues.map((i) => `<article><span>${e(i.label)}</span><h3>${br(i.title)}</h3><p>${e(i.body)}</p></article>`).join("")}</div></section><section class="standards">${chapter(d.chapters[1], 1)}<p class="standard-intro">${e(d.standardIntro)}</p><div class="standard-cards">${d.standards
    .map(
      (s, i) =>
        `<article class="standard-card standard-${i}"><div class="standard-heading"><span>${e(s.label)}</span><h3>${e(s.title)}</h3></div><div class="standard-layout"><p>${br(s.body)}</p><div class="standard-main-photo">${image(s.images[0].src, "")}</div><div class="standard-collage">${s.images
          .slice(1)
          .map((p) => image(p.src, ""))
          .join("")}</div></div></article>`,
    )
    .join(
      "",
    )}</div></section><section class="charters">${chapter(d.chapters[2], 2)}<div class="charter-content"><p>${br(d.charterIntro)}</p><h3>${e(d.charterTitle)}</h3><dl>${d.charters.map((c, i) => `<div style="--charter-color:${["#248f11", "#ff0004", "#ffab4b", "#1965e6", "#ac50d4"][i]}"><dt>${e(c.jp)}<span lang="en">${e(c.en)}</span></dt><dd>${e(c.body)}</dd></div>`).join("")}</dl></div></section>`;
}
function about() {
  const d = content.about;
  return `${hero(d, "団体概要")}<section class="organization-info">${image(d.logo, "HEROES", 'class="organization-logo" width="240" height="191"')}<dl class="organization-table">${d.facts.map((f) => `<div><dt>${e(f.label)}</dt><dd>${f.label === "会計報告" ? `<button class="text-link" type="button" data-preview="document">›　${e(f.value)}</button>` : br(f.value)}</dd></div>`).join("")}</dl></section><section class="directors">${heading("会長・理事・監事", "Chairman, Directors, Auditor", "red")}<div class="people-grid">${d.people.map((p, i) => `<figure style="--person-color:${["#a9001c", "#248f11", "#ffab4b"][i % 3]}">${image(p.image, p.name)}<figcaption><span>${e(p.role)}</span><strong>${e(p.name)}</strong></figcaption></figure>`).join("")}</div></section>`;
}
function cheers() {
  const d = content.cheers;
  return `${hero(d, "チアーズとは")}${intro(d)}<section class="donation-uses"><h2>ご寄付の活用例</h2><ul class="check-list">${d.uses.map((t) => `<li>${e(t)}</li>`).join("")}</ul>${mosaic(d.mosaic)}</section><section class="donation-plans"><h2>ご寄付プランのご紹介</h2><p class="plan-intro">${br(d.planIntro)}</p><div class="plans-grid">${d.plans.map((p, i) => `<article class="plan plan-${i}"><header><h3>${e(p.label)}</h3><p><strong>${p.price}</strong>円/年</p></header><div class="plan-copy"><ul>${p.perks.map((t) => `<li>${e(t)}</li>`).join("")}</ul><p>${e(p.body)}</p></div></article>`).join("")}</div><div class="donation-procedure"><h3>お手続きのご案内</h3><div><p>${br(d.notice)}</p>${image(d.payment[0].src, "VISA、Mastercard、JCB、American Express、Diners Club", 'class="payment-brands"')}${notice("寄付する", "gold", "donation")}</div></div><div class="cheers-line"><div class="line-phone">${image(d.lineImage, "チアーズ公式LINEの画面")}</div><div><h3>${image("images/line.svg", "", 'width="36" height="36"')}チアーズ公式LINE</h3><ul class="check-list"><li>大会・イベントの最新情報</li><li>活動報告</li><li>LINE限定コンテンツ</li></ul><p>など配信中！</p></div>${notice("公式LINE登録", "line-green", "social")}</div></section>`;
}
function partners() {
  const d = content.partners;
  return `${hero(d, "企業・団体の皆様へ")}<div class="partners-intro">${intro(d)}<a class="button gold" href="${href("/contact-us/")}"><span aria-hidden="true">›</span><span>企業・団体向け<br class="sp-copy">支援制度に関するお問い合わせ</span></a></div>${mosaic(d.mosaic)}`;
}
const categories = [
  "お知らせ",
  "イベント",
  "トライドリームカップ",
  "ヒーローズカップ",
  "ヒーローズプロジェクト",
  "ラガール",
  "ラグビーフェスティバル",
];
function news() {
  const d = content.news;
  return `<section class="news-page plain-page">${heading("お知らせ", "What’s new?", "gold", "h1")}<div class="news-surface"><div class="news-inner"><form class="news-filters" role="search" id="news-search"><div class="filter-row"><p>カテゴリごとに見る</p><div class="category-filters">${categories.map((c) => `<button type="button" data-category="${c}" aria-pressed="false">#${c}</button>`).join("")}</div></div><div class="filter-row"><label for="news-month">月ごとに見る</label><select id="news-month" name="month"><option value="">年月を選択</option><option value="2026.08">2026年8月</option><option value="2026.03">2026年3月</option><option value="2026.01">2026年1月</option></select></div><div class="filter-row"><label for="news-keyword">キーワードで探す</label><div class="keyword-field"><input id="news-keyword" name="keyword" placeholder="キーワードを入力" type="search"><button type="submit">検索<span aria-hidden="true">⌕</span></button></div></div></form><p id="search-status" class="search-status" aria-live="polite" hidden></p><div class="news-list">${d.rows.map((n, i) => `<button type="button" class="news-row" data-preview="article" data-news-row data-category="${n.category}" data-month="${n.date.slice(0, 7)}">${image(d.image, "")}<span class="news-row-copy"><strong><span class="pc-copy">${e(n.title)}</span><span class="sp-copy">${e(d.mobileTitle)}</span></strong><span>#${e(n.category)}</span><time>${n.date}</time></span></button>`).join("")}</div><button class="button gold more-news" type="button" data-preview="more"><span aria-hidden="true">›</span>もっと見る</button></div></div></section>`;
}
function article() {
  const d = content.article;
  return `<section class="article-page plain-page">${heading("お知らせ", "What’s new?", "gold", "h1")}<div class="article-surface"><article><header><h2>${e(d.title)}</h2><div><time datetime="2026-03-10">${d.date}</time><p>#お知らせ　#ヒーローズカップ</p></div></header><div class="article-body"><p>${br(d.body)}</p><button class="video-preview" type="button" data-preview="video" aria-label="本編ダイジェスト動画の確認用案内">${image(d.image, "The 18th HEROES CUP 本編ダイジェスト")}</button></div></article><nav class="article-nav" aria-label="記事ナビゲーション"><button type="button" data-preview="article"><strong>前の記事</strong><span>${e(d.previous)}</span></button><a href="${href("/news/")}">お知らせ一覧へ</a><button type="button" data-preview="article"><strong>次の記事</strong><span>${e(d.next)}</span></button></nav></div></section>`;
}
function contact() {
  return `<section class="contact-page plain-page">${heading("お問い合わせ", "Contact", "gold", "h1")}<div class="contact-surface"><p>以下メールアドレスへお問い合わせください。</p><a href="mailto:contact@npo-heroes.com">contact@npo-heroes.com</a></div></section>`;
}
const renderers = {
  top,
  mission,
  about,
  cheers,
  partners,
  news,
  article,
  contact,
};
export function renderPage(route) {
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="NPO HEROESのデザイン確認用サイトです。"><title>${e(route.title)} | NPO HEROES 確認用モック</title><link rel="icon" href="/images/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/src/styles/site.css"><script type="module" src="/src/main.ts"></script></head><body class="page-${route.key}">${header()}<main id="main">${renderers[route.key]()}</main>${footer(route)}<dialog id="preview-dialog" aria-labelledby="preview-title"><button class="dialog-close" type="button" aria-label="閉じる">×</button><h2 id="preview-title">確認用モックのご案内</h2><p id="preview-message"></p><button class="button red dialog-close" type="button">閉じる</button></dialog></body></html>`;
}
