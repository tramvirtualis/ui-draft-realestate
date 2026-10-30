import { useEffect, useState } from "react";
import { projectUnitsService } from "../../services/project/projectUnitsService";
import type { ProjectUnitsData } from "../../types/project/projectUnits.types";
import { PROJECT_UNAVAILABLE, projectLoadError } from "../../utils/projectError";

export type ProjectUnitsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ProjectUnitsData };

// Tải thông tin dự án + quỹ căn theo id; đổi reloadKey để tải lại (giữ nguyên dữ liệu cũ trong lúc tải)
export function useProjectUnits(id: number | undefined, reloadKey = 0): ProjectUnitsState {
  const [state, setState] = useState<ProjectUnitsState>(
    id === undefined ? { status: "error", message: PROJECT_UNAVAILABLE } : { status: "loading" },
  );

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    projectUnitsService
      .getProjectUnits(id)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((e) => !cancelled && setState({ status: "error", message: projectLoadError(e) }));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return state;
}
