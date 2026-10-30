import { useEffect, useState } from "react";
import jobService from "../../services/job/jobService";
import type { JobType } from "../../types/job/job.types";

// Loại công việc ít thay đổi → cache dùng chung cho cả phiên
let cache: JobType[] | null = null;

//Loại công việc đang hiển thị (cho ô lọc); lỗi thì trả mảng rỗng
export function useJobTypes() {
  const [jobTypes, setJobTypes] = useState<JobType[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let ignore = false;
    jobService
      .getJobTypes()
      .then((res) => {
        cache = res;
        if (!ignore) setJobTypes(res);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  return jobTypes;
}
