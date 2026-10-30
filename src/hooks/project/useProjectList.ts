import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../api";
import { projectService } from "../../services/project/projectService";
import type { ProjectDto } from "../../types/project/project.types";

// Số dự án mỗi lần gọi khi gom toàn bộ danh sách
const BATCH = 100;

// Toàn bộ dự án đang công khai: BE chỉ hỗ trợ phân trang (chưa có tìm kiếm / lọc / sắp xếp) nên tải hết một lần,
// trang danh sách tự lọc, sắp xếp và chia trang phía client. `reload` để thử lại khi lỗi
export function useProjectList() {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      const first = await projectService.getProjects(0, BATCH);
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) => projectService.getProjects(i + 1, BATCH)),
      );
      return [first, ...rest].flatMap((p) => p.content);
    })()
      .then((all) => !cancelled && setProjects(all))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { projects, loading, error, reload };
}
