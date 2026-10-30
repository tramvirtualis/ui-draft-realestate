import { useEffect, useState } from "react";
import { adminProjectService } from "../../services/project/adminProjectService";
import type { AdminProject } from "../../types/project/adminProject.types";

export type AdminProjectState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; project: AdminProject };

// Tải một dự án theo id; `reload` đổi giá trị để tải lại (sau khi ẩn/hiện...)
export function useAdminProject(id: number | undefined, reload = 0) {
  const [state, setState] = useState<AdminProjectState>({ status: id === undefined ? "error" : "loading" });

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    adminProjectService
      .get(id)
      .then((project) => !cancelled && setState({ status: "ready", project }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [id, reload]);

  return state;
}
