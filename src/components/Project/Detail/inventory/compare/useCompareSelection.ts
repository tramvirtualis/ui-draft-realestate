import { useCallback, useEffect, useState } from "react";

export const MAX_COMPARE = 5;

const storageKey = (projectId: number) => `unit-compare:${projectId}`;

// Danh sách căn đã chọn được nhớ trong phiên, để mở chi tiết / sang tab khác rồi quay lại vẫn còn
function read(projectId: number | null): number[] {
  if (projectId === null) return [];
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey(projectId)) ?? "[]");
    return Array.isArray(value) ? value.filter((n): n is number => typeof n === "number").slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

// Các căn đang chọn để so sánh của một dự án (tối đa MAX_COMPARE căn, giữ thứ tự chọn)
export function useCompareSelection(projectId: number | null) {
  const [state, setState] = useState(() => ({ projectId, ids: read(projectId) }));
  // Đổi sang dự án khác thì lấy danh sách của dự án đó
  if (state.projectId !== projectId) setState({ projectId, ids: read(projectId) });
  const { ids } = state;

  useEffect(() => {
    if (projectId === null) return;
    try {
      sessionStorage.setItem(storageKey(projectId), JSON.stringify(ids));
    } catch {
      // Trình duyệt chặn lưu trữ: vẫn so sánh được, chỉ không nhớ sau khi tải lại
    }
  }, [projectId, ids]);

  const update = useCallback((next: (ids: number[]) => number[]) => setState((s) => ({ ...s, ids: next(s.ids) })), []);

  const toggle = useCallback(
    (id: number) => update((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length >= MAX_COMPARE ? list : [...list, id])),
    [update],
  );
  const remove = useCallback((id: number) => update((list) => list.filter((x) => x !== id)), [update]);
  const clear = useCallback(() => update(() => []), [update]);

  return { ids, toggle, remove, clear, full: ids.length >= MAX_COMPARE };
}
