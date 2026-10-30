import { useEffect, useState } from "react";
import jobService from "../../services/job/jobService";
import { getErrorMessage, getErrorStatus } from "../../api";
import type { Job } from "../../types/job/job.types";

export function useJobDetail(id: number) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setJob(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    jobService
      .getJobById(id)
      .then((res) => !ignore && setJob(res))
      .catch((err) => {
        if (ignore) return;
        setJob(null);
        if (getErrorStatus(err) === 404) setNotFound(true);
        else setError(getErrorMessage(err));
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [id]);

  return { job, loading, error, notFound };
}
