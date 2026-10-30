import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import JobDetailHero from "../../components/JobDetail/JobDetailHero";
import JobDescription from "../../components/JobDetail/JobDescription";
import JobGeneralInfo from "../../components/JobDetail/JobGeneralInfo";
import SimilarJobs from "../../components/JobDetail/SimilarJobs";
import ApplySummaryCard from "../../components/JobDetail/ApplySummaryCard";
import JobOwnerCard from "../../components/JobDetail/JobOwnerCard";
import CreateCvPromo from "../../components/JobDetail/CreateCvPromo";
import MobileApplyBar from "../../components/JobDetail/MobileApplyBar";
import JobNotFound from "../../components/JobDetail/JobNotFound";
import ApplyModal from "../../components/JobDetail/ApplyModal/ApplyModal";
import { buildJobDetail } from "../../components/JobDetail/buildJobDetail";
import { useJobDetail } from "../../hooks/job/useJobDetail";
import { useAppliedJobs } from "../../hooks/job/useAppliedJobs";
import useSavedJobs from "../../hooks/job/useSavedJobs";
import { selectAuthStatus, useAppSelector } from "../../store";

export default function JobDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const authStatus = useAppSelector(selectAuthStatus);
  const {
    job: raw,
    loading,
    error,
    notFound,
  } = useJobDetail(/^\d+$/.test(id ?? "") ? Number(id) : NaN);
  const job = raw ? buildJobDetail(raw) : null;
  const { isApplied, markApplied } = useAppliedJobs();
  const applied = job ? isApplied(job.id) : false;
  const { savedIds, toggle, loginPrompt } = useSavedJobs();
  const saved = job ? savedIds.includes(job.id) : false;
  const [justApplied, setJustApplied] = useState(false);

  const applyOpen = params.get("apply") === "1";
  const setApplyOpen = (open: boolean) => {
    const next = new URLSearchParams(params);
    if (open) next.set("apply", "1");
    else next.delete("apply");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setJustApplied(false);
  }, [id]);

  return (
    <>
      <title>{`${job?.title ?? "Việc làm"} | Tuyển dụng NovaLand Hub`}</title>

      <div className="container mx-auto px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
        <Breadcrumb
          items={[
            { label: "Trang chủ", to: "/" },
            { label: "Tuyển dụng", to: "/jobs" },
            { label: job?.title ?? "Chi tiết việc làm" },
          ]}
        />

        <div className="mt-5">
          {loading ? (
            <div
              className="space-y-6"
              aria-busy="true"
              aria-label="Đang tải tin tuyển dụng"
            >
              <div className="h-64 animate-pulse rounded-3xl bg-primary-50/60" />
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="h-96 animate-pulse rounded-3xl bg-primary-50/60" />
                <div className="h-64 animate-pulse rounded-3xl bg-primary-50/60" />
              </div>
            </div>
          ) : job && raw ? (
            <>
              <JobDetailHero
                job={job}
                company={raw.company}
                applied={applied}
                onApply={() => setApplyOpen(true)}
                saved={saved}
                onToggleSave={() => toggle(job.id)}
              />

              <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="min-w-0 space-y-6">
                  {job.sections.length > 0 && (
                    <JobDescription sections={job.sections} />
                  )}
                  <JobGeneralInfo job={job} />
                  <SimilarJobs
                    key={job.id}
                    currentJobId={job.id}
                    jobTypeId={raw.jobType?.id ?? null}
                    jobTypeName={job.jobTypeName}
                  />
                </div>

                <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
                  <div className="hidden lg:block">
                    <ApplySummaryCard
                      job={job}
                      applied={applied}
                      onApply={() => setApplyOpen(true)}
                      saved={saved}
                      onToggleSave={() => toggle(job.id)}
                    />
                  </div>
                  {(raw.company || raw.recruiter) && (
                    <JobOwnerCard
                      recruiter={raw.recruiter}
                      company={raw.company}
                    />
                  )}
                  <CreateCvPromo />
                </aside>
              </div>
            </>
          ) : notFound || !error ? (
            <JobNotFound />
          ) : (
            <p
              role="alert"
              className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-500"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {loginPrompt}
      {job && (
        <MobileApplyBar
          salaryText={job.salaryText}
          applied={applied}
          onApply={() => setApplyOpen(true)}
        />
      )}

      {job && applyOpen && authStatus === "unauthenticated" && (
        <AuthRequiredModal
          message="Đăng nhập để ứng tuyển và theo dõi hồ sơ của bạn."
          onClose={() => setApplyOpen(false)}
        />
      )}
      {job &&
        applyOpen &&
        authStatus === "authenticated" &&
        (!applied || justApplied) && (
          <ApplyModal
            key={job.id}
            jobId={job.id}
            jobTitle={job.title}
            onApplied={() => {
              setJustApplied(true);
              markApplied(job.id);
            }}
            onClose={() => setApplyOpen(false)}
          />
        )}
    </>
  );
}
