import { Link } from "react-router-dom";
import CvPicker from "./CvPicker";
import CvUploader from "./CvUploader";
import type { MyCv } from "../../../types/job/myCv.types";

export type ApplyTab = "existing" | "upload";

/** Phần "Chọn CV" trong modal: 2 tab "CV đã tải lên" và "Tải CV lên" */
export default function ApplyCvSection({
  tab,
  onTabChange,
  cvs,
  cvsLoading,
  selectedCvId,
  onSelectCv,
  file,
  onFileChange,
  saveCv,
  onSaveCvChange,
  cvTitle,
  onCvTitleChange,
  error,
}: {
  tab: ApplyTab;
  onTabChange: (tab: ApplyTab) => void;
  cvs: MyCv[];
  cvsLoading: boolean;
  selectedCvId: number | null;
  onSelectCv: (id: number) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** true: lưu tệp vào "CV của tôi" (POST /me/cvs) rồi mới nộp bằng cvId */
  saveCv: boolean;
  onSaveCvChange: (save: boolean) => void;
  cvTitle: string;
  onCvTitleChange: (title: string) => void;
  error?: string;
}) {
  const tabBtn = (id: ApplyTab, label: string) => (
    <button
      type="button"
      role="tab"
      id={`apply-tab-${id}`}
      aria-selected={tab === id}
      aria-controls="apply-tabpanel"
      onClick={() => onTabChange(id)}
      className={`flex-1 rounded-lg py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
        tab === id
          ? "bg-white font-medium text-primary-700 shadow-sm"
          : "text-body hover:text-primary-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-heading">Chọn CV</p>
        <Link to="/account/cvs" className="text-xs font-medium text-primary-600 hover:underline">
          Quản lý CV
        </Link>
      </div>
      <div
        role="tablist"
        aria-label="Nguồn CV"
        className="flex gap-1 rounded-xl bg-primary-50 p-1"
      >
        {tabBtn("existing", "CV đã tải lên")}
        {tabBtn("upload", "Tải CV lên")}
      </div>
      <div
        role="tabpanel"
        id="apply-tabpanel"
        aria-labelledby={`apply-tab-${tab}`}
        className="mt-3"
      >
        {tab === "existing" ? (
          <CvPicker
            cvs={cvs}
            loading={cvsLoading}
            selectedId={selectedCvId}
            onSelect={onSelectCv}
            error={error}
          />
        ) : (
          <div className="space-y-3">
            <CvUploader file={file} onChange={onFileChange} error={error} />
            {file && (
              <div className="rounded-2xl bg-primary-50/60 p-3.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={saveCv}
                    onChange={(e) => onSaveCvChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary-600"
                  />
                  <span className="text-sm text-heading">
                    Lưu vào "CV của tôi" để dùng cho lần ứng tuyển sau
                  </span>
                </label>
                {saveCv && (
                  <div className="mt-3">
                    <label
                      htmlFor="apply-cv-title"
                      className="mb-1 block text-xs font-medium text-body"
                    >
                      Tên CV
                    </label>
                    <input
                      id="apply-cv-title"
                      value={cvTitle}
                      maxLength={255}
                      onChange={(e) => onCvTitleChange(e.target.value)}
                      placeholder="VD: CV Kinh doanh 2026"
                      className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-heading outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
