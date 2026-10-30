import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import { JOB_SORT_PARAM } from "../../types/job/job.types";
import type {
  Job,
  JobFilter,
  JobSort,
  JobType,
  PageResponse,
} from "../../types/job/job.types";

export interface GetJobsParams {
  filter: JobFilter;
  sort: JobSort;
  page: number;
  size: number;
}

/** API công khai: chỉ trả tin đang tuyển (OPEN, chưa quá hạn) → dùng publicHttp */
class JobService extends BaseService {
  constructor() {
    super("", { auth: false });
  }

  // GET /jobs?jobTypeId=&employmentType=&experienceLevel=&location=&keyword=&page=&size=&sort=
  async getJobs({
    filter,
    sort,
    page,
    size,
  }: GetJobsParams): Promise<PageResponse<Job>> {
    const res = await this.getPage<Job>(
      {
        keyword: filter.keyword.trim(),
        jobTypeId: filter.jobTypeId,
        employmentType: filter.employmentType,
        experienceLevel: filter.experienceLevel,
        location: filter.location,
        page,
        size,
        sort: JOB_SORT_PARAM[sort],
      },
      "jobs"
    );
    return toPage(res);
  }

  // GET /jobs/{id}
  async getJobById(id: number): Promise<Job> {
    return this.http.get<Job>(this.url("jobs", id));
  }

  // GET /job-types
  async getJobTypes(size = 100): Promise<JobType[]> {
    const res = await this.getPage<JobType>(
      { page: 0, size, sort: "name,asc" },
      "job-types"
    );
    return toPage(res).content;
  }
}

const jobService = new JobService();
export default jobService;
