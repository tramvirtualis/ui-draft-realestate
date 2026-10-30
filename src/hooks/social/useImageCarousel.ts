import { useCallback, useState } from "react";

// Chuyển ảnh trước/sau, quay vòng khi tới đầu/cuối
export function useImageCarousel(count: number, startIndex = 0) {
  const [index, setIndex] = useState(startIndex);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  return { index, prev, next };
}
