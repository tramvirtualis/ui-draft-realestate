import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_JOB_FILTER,
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  JOB_SORT,
  JOB_SORT_LABEL,
  type JobFilter,
  type JobSort,
} from "../../types/job/job.types";

const oneOf = <T extends string>(
  value: string | null,
  allowed: Record<T, unknown>
): T | "" => (value && value in allowed ? (value as T) : "");

export default function useJobFilterParams() {
  const [params, setParams] = useSearchParams();

  const filter = useMemo<JobFilter>(
    () => ({
      keyword: params.get("q") ?? "",
      jobTypeId: /^\d+$/.test(params.get("type") ?? "")
        ? params.get("type")!
        : "",
      employmentType: oneOf(params.get("employment"), EMPLOYMENT_TYPE_LABEL),
      experienceLevel: oneOf(params.get("level"), EXPERIENCE_LEVEL_LABEL),
      location: params.get("location") ?? "",
    }),
    [params]
  );

  const sort = (oneOf(params.get("sort"), JOB_SORT_LABEL) ||
    JOB_SORT.NEWEST) as JobSort;
  const page = Math.max(0, (Number(params.get("page")) || 1) - 1);

  const write = useCallback(
    (f: JobFilter, s: JobSort, p: number) => {
      const next = new URLSearchParams();
      if (f.keyword) next.set("q", f.keyword);
      if (f.jobTypeId) next.set("type", f.jobTypeId);
      if (f.employmentType) next.set("employment", f.employmentType);
      if (f.experienceLevel) next.set("level", f.experienceLevel);
      if (f.location) next.set("location", f.location);
      if (s !== JOB_SORT.NEWEST) next.set("sort", s);
      if (p > 0) next.set("page", String(p + 1));
      setParams(next);
    },
    [setParams]
  );

  return {
    filter,
    sort,
    page,
    setFilter: (f: JobFilter) => write(f, sort, 0),
    resetFilter: () => write(DEFAULT_JOB_FILTER, sort, 0),
    setSort: (s: JobSort) => write(filter, s, 0),
    setPage: (p: number) => write(filter, sort, p),
  };
}
