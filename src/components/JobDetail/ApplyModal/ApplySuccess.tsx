import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { ApplicantInfo } from "../../../types/job/jobDetail.types";

/** Màn hình "Hồ sơ đã được gửi" (chỉ giao diện) */
export default function ApplySuccess({
  jobTitle,
  applicant,
  cvLabel,
}: {
  jobTitle: string;
  applicant: ApplicantInfo;
  cvLabel: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-green-500 ring-8 ring-primary-50/60">
        <Check size={30} strokeWidth={2.5} aria-hidden />
      </span>
      <h3 className="mt-5 text-xl font-semibold text-heading">
        Hồ sơ đã được gửi
      </h3>
      <p className="mt-2 max-w-sm text-sm text-body">
        Bạn đã ứng tuyển vị trí {jobTitle}.
      </p>
      <span className="mt-3 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-medium text-primary-700">
        Chờ duyệt
      </span>

      <div className="mt-5 w-full space-y-1 rounded-2xl bg-primary-50 p-4 text-left">
        <p className="text-sm font-semibold text-heading">
          {applicant.fullName}
        </p>
        <p className="text-xs text-body">{applicant.email}</p>
        <p className="text-xs text-body">{applicant.phone}</p>
        <p className="text-xs font-medium text-primary-600">{cvLabel}</p>
      </div>

      <p className="mt-5 text-xs text-body">
        Theo dõi phản hồi trong{" "}
        <Link
          to="/applications"
          className="font-medium text-primary-600 hover:underline"
        >
          Lịch sử ứng tuyển
        </Link>
        .
      </p>

      <Link
        to="/jobs"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95"
      >
        Xem việc làm khác
      </Link>
    </div>
  );
}
