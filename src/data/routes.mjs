export const base = "/npo-heroes-preview/";
export const articlePath = "/news/the-18th-heroes-cup-【本編ダイジェスト】/";
export const routes = [
  { key: "top", path: "/", title: "NPO HEROES" },
  { key: "mission", path: "/mission/", title: "私たちについて" },
  { key: "about", path: "/about-us/", title: "団体概要" },
  { key: "cheers", path: "/cheers/", title: "チアーズとは" },
  { key: "partners", path: "/partners/", title: "企業・団体の皆様へ" },
  { key: "news", path: "/news/", title: "お知らせ一覧" },
  {
    key: "article",
    path: articlePath,
    title: "The 18th HEROES CUP 【本編ダイジェスト】",
  },
  { key: "contact", path: "/contact-us/", title: "お問い合わせ" },
];
export const href = (path) => base + path.replace(/^\//, "");
