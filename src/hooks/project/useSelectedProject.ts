import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "admin.selectedProject";
const listeners = new Set<() => void>();

const readStored = (): number | null => {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

// Ghi dự án đang chọn và báo cho mọi nơi đang dùng (menu, thanh tab, các trang) cập nhật ngay
export const rememberSelectedProject = (id: number) => {
  if (readStored() === id) return;
  try {
    localStorage.setItem(STORAGE_KEY, String(id));
  } catch {
    /* bỏ qua: chỉ là tiện ích ghi nhớ */
  }
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  // Cập nhật khi đổi dự án ở tab trình duyệt khác
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
};

// Dự án chọn gần nhất (đồng bộ giữa các trang quản trị và các tab trình duyệt)
export function useRememberedProject(): number | null {
  return useSyncExternalStore(subscribe, readStored, () => null);
}

/**
 Dự án đang quản lý, dùng chung cho các trang quản lý theo dự án (tiện ích, video, tiến độ, ảnh...).
 Thứ tự ưu tiên: ?project= trên URL → dự án chọn gần nhất → dự án đầu tiên.
 Chọn dự án ở trang nào thì mọi trang, menu và thanh tab khác cùng đổi theo.
 */
export function useSelectedProject(projects: { id: number }[]) {
  const [params, setParams] = useSearchParams();
  const queryId = Number(params.get("project"));
  const stored = useRememberedProject();

  const projectId =
    projects.find((p) => p.id === queryId)?.id ??
    projects.find((p) => p.id === stored)?.id ??
    projects[0]?.id ??
    null;

  useEffect(() => {
    if (projectId !== null) rememberSelectedProject(projectId);
  }, [projectId]);

  const select = useCallback(
    (id: number) => {
      rememberSelectedProject(id);
      setParams({ project: String(id) }, { replace: true });
    },
    [setParams],
  );

  return { projectId, select };
}
