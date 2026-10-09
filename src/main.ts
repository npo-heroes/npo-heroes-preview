import { matchesNews } from "./search";

const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
const menu = document.querySelector<HTMLElement>("#mobile-menu");
const main = document.querySelector<HTMLElement>("main");
const footer = document.querySelector<HTMLElement>(".site-footer");
function setMenu(open: boolean): void {
  if (!menu || !menuButton) return;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "メニューを閉じる" : "メニューを開く",
  );
  document.body.classList.toggle("menu-open", open);
  if (main) main.inert = open;
  if (footer) footer.inert = open;
}
menuButton?.addEventListener("click", () => setMenu(Boolean(menu?.hidden)));
menu
  ?.querySelectorAll("a")
  .forEach((anchor) => anchor.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !document.querySelector("dialog[open]") &&
    menu &&
    !menu.hidden
  ) {
    setMenu(false);
    menuButton?.focus();
  }
});
matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

const messages: Record<string, string> = {
  donation:
    "こちらはデザイン確認用サイトです。寄付・決済の手続きは行われません。",
  article:
    "この記事の詳細デザインは確認対象に含まれていません。詳細ページはトップのお知らせ「The 18th HEROES CUP 【本編ダイジェスト】」からご確認いただけます。",
  social:
    "こちらはSNSへの導線を確認するためのモックです。登録や外部サービスへの移動は行われません。",
  document: "会計報告のダウンロードはこの確認用サイトでは行われません。",
  video:
    "こちらは動画の掲載位置を確認するためのモックです。動画の再生は行われません。",
  more: "Figmaで提供されたお知らせをすべて表示しています。このモックで追加の読み込みは行われません。",
  page: "このページは今回のデザイン確認の対象に含まれていません。",
};
const dialog = document.querySelector<HTMLDialogElement>("#preview-dialog");
const message = document.querySelector<HTMLElement>("#preview-message");
document
  .querySelectorAll<HTMLButtonElement>("[data-preview]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      if (!dialog || !message) return;
      message.textContent =
        messages[button.dataset.preview ?? "page"] ?? messages.page;
      dialog.showModal();
    });
  });
dialog
  ?.querySelectorAll(".dialog-close")
  .forEach((button) => button.addEventListener("click", () => dialog.close()));

const search = document.querySelector<HTMLFormElement>("#news-search");
if (search) {
  const month = search.querySelector<HTMLSelectElement>("#news-month");
  const keyword = search.querySelector<HTMLInputElement>("#news-keyword");
  const status = document.querySelector<HTMLElement>("#search-status");
  const categoryButtons =
    search.querySelectorAll<HTMLButtonElement>("[data-category]");
  const rows = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-news-row]"),
  ];
  const update = (): void => {
    const category =
      search.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.dataset
        .category ?? "";
    const filter = {
      category,
      month: month?.value ?? "",
      keyword: keyword?.value ?? "",
    };
    rows.forEach((row) => {
      row.hidden = !matchesNews(
        {
          category: row.dataset.category ?? "",
          month: row.dataset.month ?? "",
          text: row.textContent ?? "",
        },
        filter,
      );
    });
    const count = rows.filter((row) => !row.hidden).length;
    if (status) {
      status.hidden =
        !filter.category && !filter.month && !filter.keyword.trim();
      status.textContent = count
        ? `${count}件のお知らせが見つかりました。`
        : "該当するお知らせはありません。";
    }
  };
  categoryButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") === "true";
      categoryButtons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button && !active)),
      );
      update();
    }),
  );
  month?.addEventListener("change", update);
  keyword?.addEventListener("input", update);
  search.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
}
