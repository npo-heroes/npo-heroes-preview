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
document
  .querySelectorAll(".site-header a, #mobile-menu a")
  .forEach((anchor) => anchor.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu && !menu.hidden) {
    setMenu(false);
    menuButton?.focus();
  }
});
matchMedia("(min-width: 1001px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

document.querySelectorAll<HTMLElement>(".photo-mosaic").forEach((mosaic) => {
  const button = mosaic.querySelector<HTMLButtonElement>(".mosaic-toggle");
  button?.addEventListener("click", () => {
    const paused = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(paused));
    button.textContent = paused ? "写真の動きを再開" : "写真の動きを停止";
    mosaic.classList.toggle("is-paused", paused);
  });
});

const search = document.querySelector<HTMLFormElement>("#news-search");
if (search) {
  const month = search.querySelector<HTMLSelectElement>("#news-month");
  const keyword = search.querySelector<HTMLInputElement>("#news-keyword");
  const status = document.querySelector<HTMLElement>("#search-status");
  const categoryButtons =
    search.querySelectorAll<HTMLButtonElement>("[data-category]");
  const rows = [...document.querySelectorAll<HTMLElement>("[data-news-row]")];
  const initialFilter = new URLSearchParams(location.search);
  categoryButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === initialFilter.get("category")),
    );
  });
  if (keyword) keyword.value = initialFilter.get("keyword") ?? "";
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
  update();
  month?.addEventListener("change", update);
  keyword?.addEventListener("input", update);
  search.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
}
