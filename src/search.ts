export interface NewsItem {
  category: string;
  month: string;
  text: string;
}
export interface NewsFilter {
  category: string;
  month: string;
  keyword: string;
}

export function matchesNews(item: NewsItem, filter: NewsFilter): boolean {
  const normalize = (value: string): string =>
    value.normalize("NFKC").toLocaleLowerCase("ja-JP");
  const words = normalize(filter.keyword).trim().split(/\s+/).filter(Boolean);
  return (
    (!filter.category || item.category === filter.category) &&
    (!filter.month || item.month === filter.month) &&
    words.every((word) => normalize(item.text).includes(word))
  );
}
