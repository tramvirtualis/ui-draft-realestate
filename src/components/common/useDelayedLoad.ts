import { useCallback, useEffect, useRef, useState } from "react";

/** Thời gian chờ mặc định trước khi gọi API khi đổi trang / bộ lọc (ms) */
export const LOAD_DELAY_MS = 1000;

type State<T> = { status: "loading" } | { status: "error" } | { status: "ready"; stamp: string; data: T };

/**
 Tải dữ liệu danh sách có chờ một nhịp trước khi gọi API, đi cùng <TableSkeleton />.
 - Lần vào trang đầu tiên: gọi ngay.
 - Đổi `key` (trang, bộ lọc, từ khóa...): hiện skeleton, chờ `delayMs` rồi mới gọi; đổi tiếp trong lúc chờ thì lượt cũ bị hủy.
 - `reload()` tải lại cùng key (vd sau khi ẩn / xóa một dòng), `retry()` khi lần tải trước bị lỗi.
 - `key` phải gom đủ mọi tham số của `fetcher` (vd JSON.stringify([page, keyword])).

   const list = useDelayedLoad(JSON.stringify([page, keyword]), () => service.search({ page, keyword }));
   {list.waiting ? <TableSkeleton rows={5} /> : list.status === "error" ? <Lỗi onRetry={list.retry} /> : <Table rows={list.data.content} />}
 */
export default function useDelayedLoad<T>(key: string, fetcher: () => Promise<T>, delayMs = LOAD_DELAY_MS) {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);
  const first = useRef(true);
  const latest = useRef(fetcher);
  useEffect(() => {
    latest.current = fetcher; // luôn gọi bản fetcher mới nhất (đúng với key hiện tại)
  });

  const stamp = `${key}#${nonce}`;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      () => {
        first.current = false;
        latest
          .current()
          .then((data) => !cancelled && setState({ status: "ready", stamp, data }))
          .catch(() => !cancelled && setState({ status: "error" }));
      },
      first.current ? 0 : delayMs,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stamp, delayMs]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const retry = useCallback(() => {
    setState({ status: "loading" });
    setNonce((n) => n + 1);
  }, []);

  // Đang chờ dữ liệu: lần đầu chưa có gì, hoặc có dữ liệu cũ nhưng key đã đổi
  const waiting = state.status === "loading" || (state.status === "ready" && state.stamp !== stamp);

  return {
    status: state.status,
    data: state.status === "ready" ? state.data : null,
    /** true: nên hiện skeleton / vòng quay */
    waiting,
    reload,
    retry,
  };
}
