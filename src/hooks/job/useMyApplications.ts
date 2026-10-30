import { useCallback, useEffect, useState } from "react";
import applicationService from "../../services/job/applicationService";
import { getErrorMessage } from "../../api/http";
import { syncAppliedJobs } from "./useAppliedJobs";
import type { Application } from "../../types/applicationHistory.types";

const FETCH_SIZE = 200;
export function useMyApplications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    applicationService
      .getMyApplications(0, FETCH_SIZE)
      .then((res) => {
        syncAppliedJobs(res.content);
        if (!ignore) setItems(res.content);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, []);

  // Lỗi được ném ra để bên gọi hiển thị toast
  const withdraw = useCallback(async (id: number) => {
    const updated = await applicationService.withdraw(id);
    setItems((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updated } : a));
      syncAppliedJobs(next);
      return next;
    });
  }, []);

  return { items, loading, error, withdraw };
}
