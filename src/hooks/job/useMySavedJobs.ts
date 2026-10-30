import { useCallback, useEffect, useState } from "react";
import savedJobService from "../../services/job/savedJobService";
import { getErrorMessage } from "../../api/http";
import type { PageResponse, SavedJob } from "../../types/job/job.types";

const EMPTY_PAGE: PageResponse<SavedJob> = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size: 0,
};

export function useMySavedJobs(page: number, size: number) {
  const [result, setResult] = useState<PageResponse<SavedJob>>(EMPTY_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    savedJobService
      .getMySavedJobs(page, size)
      .then((res) => !ignore && setResult(res))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [page, size, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { result, loading, error, reload };
}
