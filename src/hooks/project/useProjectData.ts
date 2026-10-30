import { useEffect, useState } from "react";
import { PROJECT_UNAVAILABLE, projectLoadError } from "../../utils/projectError";

export type ProjectDataState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

// Tải dữ liệu theo id dự án; `loader` nên ổn định (khai báo ngoài component)
export function useProjectData<T>(id: number | undefined, loader: (id: number) => Promise<T>): ProjectDataState<T> {
  const [state, setState] = useState<ProjectDataState<T>>(
    id === undefined ? { status: "error", message: PROJECT_UNAVAILABLE } : { status: "loading" },
  );

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    loader(id)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((e) => !cancelled && setState({ status: "error", message: projectLoadError(e) }));
    return () => {
      cancelled = true;
    };
  }, [id, loader]);

  return state;
}
