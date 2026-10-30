import { useEffect, useState } from "react";
import { projectOverviewService } from "../../services/project/projectOverviewService";
import type { ProjectOverviewData } from "../../types/project/projectOverview.types";
import { PROJECT_UNAVAILABLE, projectLoadError } from "../../utils/projectError";

export type ProjectOverviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ProjectOverviewData };

// Tải toàn bộ dữ liệu trang tổng quan của một dự án theo id
export function useProjectOverview(id: number | undefined): ProjectOverviewState {
  const [state, setState] = useState<ProjectOverviewState>(
    id === undefined ? { status: "error", message: PROJECT_UNAVAILABLE } : { status: "loading" },
  );

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    projectOverviewService
      .getProjectOverview(id)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((e) => !cancelled && setState({ status: "error", message: projectLoadError(e) }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
