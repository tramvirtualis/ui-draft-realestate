import { useEffect, useState } from "react";
import jobService, { type GetJobsParams } from "../../services/job/jobService";
import { getErrorMessage } from "../../api/http";
import type { Job, PageResponse } from "../../types/job/job.types";

const EMPTY_PAGE: PageResponse<Job> = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size: 0,
};

// Danh sách tin đang tuyển theo bộ lọc / sắp xếp / trang
export function useJobs({ filter, sort, page, size }: GetJobsParams) {
  const [result, setResult] = useState<PageResponse<Job>>(EMPTY_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filter là object mới mỗi lần render → so sánh theo nội dung
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    jobService
      .getJobs({ filter: JSON.parse(filterKey), sort, page, size })
      .then((res) => !ignore && setResult(res))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [filterKey, sort, page, size]);

  return { result, loading, error };
}
