import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Send, X } from "lucide-react";
import ApplyCvSection, { type ApplyTab } from "./ApplyCvSection";
import ApplyFormFields, { type ApplyFormErrors, type ApplyFormValues } from "./ApplyFormFields";
import ApplySuccess from "./ApplySuccess";
import useFocusTrap from "../../common/useFocusTrap";
import applicationService from "../../../services/job/applicationService";
import { useMyCvs } from "../../../hooks/job/useMyCvs";
import { getErrorMessage } from "../../../api/http";
import { selectCurrentUser, useAppSelector } from "../../../store";
import { cvTitleFromFile, validateCvFile } from "../../../types/job/myCv.types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Khớp @Pattern của ApplicationRequest bên BE
const PHONE_RE = /^0\d{9,10}$/;

const normalizePhone = (phone: string) => phone.replace(/[\s.-]/g, "");

/**
 * Modal "Ứng tuyển nhanh" (desktop: giữa màn hình, mobile: bottom sheet).
 * Gửi POST /jobs/:id/applications kèm cvId (CV đã tải lên) hoặc file cvFile.
 * Tải tệp mới mà chọn "Lưu vào CV của tôi" thì POST /me/cvs trước rồi nộp bằng cvId.
 * Chỉ mở khi đã đăng nhập (trang cha chặn).
 */
export default function ApplyModal({
  jobId,
  jobTitle,
  onApplied,
  onClose,
}: {
  jobId: number;
  jobTitle: string;
  /** gọi sau khi BE nhận đơn → đánh dấu tin đã ứng tuyển */
  onApplied?: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose);

  const user = useAppSelector(selectCurrentUser);
  const { cvs, loading: cvsLoading, upload } = useMyCvs();

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [tab, setTab] = useState<ApplyTab>("existing");
  const [cvId, setCvId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saveCv, setSaveCv] = useState(true);
  const [cvTitle, setCvTitle] = useState("");
  const [cvLabel, setCvLabel] = useState("");
  const [values, setValues] = useState<ApplyFormValues>({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    coverLetter: "",
  });
  const [errors, setErrors] = useState<ApplyFormErrors>({});
  const [cvError, setCvError] = useState("");

  // Tải xong CV: chọn sẵn CV mặc định; chưa có CV nào thì chuyển sang tab tải lên
  useEffect(() => {
    if (cvsLoading) return;
    if (cvs.length === 0) setTab("upload");
    else setCvId((id) => id ?? (cvs.find((c) => c.isDefault) ?? cvs[0]).id);
  }, [cvs, cvsLoading]);

  const hasError = !!cvError || Object.keys(errors).length > 0;

  const handleSubmit = async () => {
    const phone = normalizePhone(values.phone);
    const next: ApplyFormErrors = {};
    if (!values.fullName.trim()) next.fullName = "Vui lòng nhập họ và tên.";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "Email không hợp lệ.";
    if (!PHONE_RE.test(phone)) next.phone = "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số.";

    let nextCvError = "";
    if (tab === "existing" && cvId === null) nextCvError = "Vui lòng chọn một CV để ứng tuyển.";
    if (tab === "upload" && !file) nextCvError = "Vui lòng tải CV lên.";
    if (tab === "upload" && file) nextCvError = validateCvFile(file);
    if (tab === "upload" && file && !nextCvError && saveCv && !cvTitle.trim())
      nextCvError = "Vui lòng đặt tên cho CV cần lưu.";

    setErrors(next);
    setCvError(nextCvError);
    setServerError("");
    if (nextCvError || Object.keys(next).length > 0) return;

    setSubmitting(true);
    let applyCvId = tab === "existing" ? cvId : null;
    let applyFile = tab === "upload" ? file : null;
    let label = tab === "existing" ? (cvs.find((c) => c.id === cvId)?.title ?? "") : (file?.name ?? "");
    try {
      if (applyFile && saveCv) {
        const saved = await upload({ title: cvTitle.trim() }, applyFile);
        applyCvId = saved.id;
        applyFile = null;
        label = saved.title;
      }
      await applicationService.apply(
        jobId,
        {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone,
          coverLetter: values.coverLetter.trim() || undefined,
          cvId: applyCvId ?? undefined,
        },
        applyFile
      );
      setCvLabel(label);
      setSent(true);
      onApplied?.();
    } catch (err) {
      setServerError(getErrorMessage(err));
      // CV đã lưu nhưng nộp đơn lỗi: chuyển sang chọn CV đó để gửi lại không bị tải trùng
      if (tab === "upload" && applyCvId !== null) {
        setTab("existing");
        setCvId(applyCvId);
        setFile(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-heading/50" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        tabIndex={-1}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-[560px] sm:rounded-3xl"
      >
        {sent ? (
          <>
            <div className="flex items-center justify-between px-6 pt-5">
              <h2 id="apply-modal-title" className="text-lg font-semibold text-heading">
                Ứng tuyển nhanh
              </h2>
              <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full bg-primary-50 p-1.5 text-primary-600 hover:bg-primary-100">
                <X size={16} />
              </button>
            </div>
            <ApplySuccess jobTitle={jobTitle} applicant={values} cvLabel={cvLabel} />
          </>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-white px-6 pb-3 pt-5">
              <div>
                <h2 id="apply-modal-title" className="text-lg font-semibold text-heading">
                  Ứng tuyển: {jobTitle}
                </h2>
                <p className="mt-1 text-xs text-body">Chọn CV và kiểm tra thông tin trước khi gửi.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full bg-primary-50 p-1.5 text-primary-600 hover:bg-primary-100">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-6 pb-5 pt-2">
              {(hasError || serverError) && (
                <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-500">
                  <AlertCircle size={14} className="shrink-0" aria-hidden />
                  {serverError || "Vui lòng kiểm tra CV và các thông tin được đánh dấu bên dưới."}
                </p>
              )}

              <ApplyCvSection
                tab={tab}
                onTabChange={(t) => {
                  setTab(t);
                  setCvError("");
                }}
                cvs={cvs}
                cvsLoading={cvsLoading}
                selectedCvId={cvId}
                onSelectCv={(id) => {
                  setCvId(id);
                  setCvError("");
                }}
                file={file}
                onFileChange={(f) => {
                  setFile(f);
                  setCvTitle(f ? cvTitleFromFile(f) : "");
                  setCvError(f ? validateCvFile(f) : "");
                }}
                saveCv={saveCv}
                onSaveCvChange={(save) => {
                  setSaveCv(save);
                  setCvError("");
                }}
                cvTitle={cvTitle}
                onCvTitleChange={(title) => {
                  setCvTitle(title);
                  setCvError("");
                }}
                error={cvError}
              />

              <ApplyFormFields
                values={values}
                errors={errors}
                onChange={(patch) => {
                  setValues((v) => ({ ...v, ...patch }));
                  setErrors((e) => {
                    const rest = { ...e };
                    (Object.keys(patch) as (keyof ApplyFormErrors)[]).forEach((k) => delete rest[k]);
                    return rest;
                  });
                }}
              />
            </div>

            <div className="sticky bottom-0 z-10 flex gap-3 border-t border-line bg-white px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="h-12 flex-1 rounded-full border border-line text-sm font-medium text-heading transition hover:bg-primary-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={15} aria-hidden /> Gửi hồ sơ
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
