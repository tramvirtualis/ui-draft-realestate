import { useEffect, useState, type RefObject } from "react";

export type TocItem = { id: string; text: string; level: 2 | 3 };
const HEADING_SELECTOR = "h2, h3, p:has(> strong:only-child)";

const isBoldParagraphHeading = (el: Element) =>
  el.tagName === "P" &&
  el.textContent?.trim() === el.querySelector("strong")?.textContent?.trim();

// Mục lục tự động: gắn id cho các tiêu đề trong khối bài viết, theo dõi tiêu đề đang đọc khi cuộn.
// `contentKey` đổi (mở bài khác) thì quét lại
export function useArticleToc(
  ref: RefObject<HTMLElement | null>,
  contentKey: unknown
) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const headings = Array.from(
      root.querySelectorAll<HTMLElement>(HEADING_SELECTOR)
    ).filter((el) => el.tagName !== "P" || isBoldParagraphHeading(el));
    const next = headings
      .map((el, i): TocItem | null => {
        const text = el.textContent?.trim() ?? "";
        if (!text) return null;
        el.id ||= `muc-${i + 1}`;
        el.dataset.tocHeading = "true";
        return { id: el.id, text, level: el.tagName === "H3" ? 3 : 2 };
      })
      .filter((x): x is TocItem => x !== null);
    setItems(next);
    setActiveId(next[0]?.id ?? null);
    if (!next.length) return;

    // Tiêu đề đang đọc: tiêu đề cuối cùng đã cuộn qua mốc 30% chiều cao màn hình
    const onScroll = () => {
      const mark = window.innerHeight * 0.3;
      let current = next[0].id;
      for (const h of headings)
        if (h.getBoundingClientRect().top <= mark) current = h.id;
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, contentKey]);

  return { items, activeId };
}
