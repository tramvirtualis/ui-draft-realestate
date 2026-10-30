import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import CvUploader from "../JobDetail/ApplyModal/CvUploader";
import { getErrorMessage } from "../../api/http";
import {
  cvTitleFromFile,
  validateCvFile,
  type CvRequest,
  type MyCv,
} from "../../types/job/myCv.types";

/** Form tải CV mới lên "CV của tôi": chọn tệp, đặt tên, tùy chọn đặt làm mặc định */
export default function MyCvUploadForm({
  hasCvs,
  onUpload,
  onUploaded,
}: {
  /** chưa có CV nào thì BE tự đặt CV đầu tiên làm mặc định → ẩn ô chọn */
  hasCvs: boolean;
  onUpload: (request: CvRequest, file: File) => Promise<MyCv>;
  onUploaded: (cv: MyCv) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextError = !file
      ? "Vui lòng chọn tệp CV."
      : validateCvFile(file) || (!title.trim() ? "Vui lòng đặt tên cho CV." : "");
    setError(nextError);
    if (nextError || !file) return;

    setSubmitting(true);
    try {
      const cv = await onUpload({ title: title.trim(), isDefault }, file);
      setFile(null);
      setTitle("");
      setIsDefault(false);
      onUploaded(cv);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="rounded-3xl border border-line bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-heading">Tải CV mới lên</h2>
      <p className="mt-1 text-xs text-body">
        CV đã lưu có thể chọn ngay khi ứng tuyển, không cần tải lại.
      </p>

      <div className="mt-4">
        <CvUploader
          file={file}
          onChange={(f) => {
            setFile(f);
            setTitle(f ? cvTitleFromFile(f) : "");
            setError(f ? validateCvFile(f) : "");
          }}
          error={error}
        />
      </div>

      {file && (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="my-cv-title" className="mb-1 block text-xs font-medium text-body">
              Tên CV
            </label>
            <input
              id="my-cv-title"
              value={title}
              maxLength={255}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="VD: CV Kinh doanh 2026"
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-heading outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          {hasCvs && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-heading">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 accent-primary-600"
              />
              Đặt làm CV mặc định
            </label>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden /> Đang tải lên...
              </>
            ) : (
              <>
                <UploadCloud size={15} aria-hidden /> Lưu CV
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
