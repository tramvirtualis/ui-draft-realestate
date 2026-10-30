import { useEffect, useState } from "react";

// Gắn ref vào 1 phần tử ở cuối danh sách: cuộn tới đó (thấy trên màn hình) thì gọi onLoadMore.
// Dùng callback ref (lưu phần tử vào state) để effect chạy lại khi phần tử mới được render
// (vd. sau khi skeleton biến mất), nếu không observer sẽ không bao giờ được gắn.
export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean, rootMargin = "0px") {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onLoadMore(),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, onLoadMore, enabled, rootMargin]);

  return setEl;
}
