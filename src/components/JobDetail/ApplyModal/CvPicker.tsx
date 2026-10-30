import { ExternalLink } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import type { MyCv } from "../../../types/job/myCv.types";

/** Tab "CV đã tải lên": danh sách CV dạng radio card */
export default function CvPicker({
  cvs,
  loading,
  selectedId,
  onSelect,
  error,
}: {
  cvs: MyCv[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2.5" aria-busy="true" aria-label="Đang tải CV">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl bg-primary-50"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {cvs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-body">
          Bạn chưa có CV nào. Chuyển sang tab "Tải CV lên" để gửi CV từ máy.
        </p>
      ) : (
        <div role="radiogroup" aria-label="Chọn CV" className="space-y-2.5">
          {cvs.map((cv) => {
            const active = cv.id === selectedId;
            return (
              <label
                key={cv.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition focus-within:outline-2 focus-within:outline-primary-600 ${
                  active
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                    : error
                    ? "border-red-200 hover:border-primary-300"
                    : "border-line hover:border-primary-300"
                }`}
              >
                <input
                  type="radio"
                  name="apply-cv"
                  checked={active}
                  onChange={() => onSelect(cv.id)}
                  className="h-4 w-4 accent-primary-600"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-heading">
                      {cv.title}
                    </span>
                    {cv.isDefault && (
                      <span className="shrink-0 rounded-full bg-primary-100 px-2 text-[10px] font-medium text-primary-700">
                        Mặc định
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400">
                    Ngày tạo {formatDate(cv.createdAt)}
                  </span>
                </span>
                <a
                  href={cv.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                >
                  Xem CV <ExternalLink size={12} aria-hidden />
                </a>
              </label>
            );
          })}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
