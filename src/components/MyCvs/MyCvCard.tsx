import { useState } from "react";
import {
  Check,
  ExternalLink,
  FileText,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import { formatCvSize, type MyCv } from "../../types/job/myCv.types";

// Một CV trong "CV của tôi": xem, đổi tên tại chỗ, đặt mặc định, xóa
export default function MyCvCard({
  cv,
  busy,
  onRename,
  onSetDefault,
  onDelete,
}: {
  cv: MyCv;
  //đang xử lý một thao tác trên CV này
  busy: boolean;
  onRename: (title: string) => Promise<boolean>;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cv.title);

  const ext = (cv.fileName.split(".").pop() ?? "").toUpperCase();
  const meta = [
    ext,
    cv.fileSize ? formatCvSize(cv.fileSize) : "",
    `Tải lên ${formatDate(cv.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const saveTitle = async () => {
    const next = title.trim();
    if (!next || next === cv.title) {
      setTitle(cv.title);
      setEditing(false);
      return;
    }
    if (await onRename(next)) setEditing(false);
  };

  const iconBtn =
    "rounded-full p-2 text-body transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-primary-600 disabled:opacity-50";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
        cv.isDefault
          ? "border-primary-300 bg-primary-50/50"
          : "border-line bg-white"
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
        <FileText size={20} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              saveTitle();
            }}
          >
            <input
              autoFocus
              value={title}
              maxLength={255}
              aria-label="Tên CV"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setTitle(cv.title);
                  setEditing(false);
                }
              }}
              className="h-9 min-w-0 flex-1 rounded-lg border border-primary-300 bg-white px-2.5 text-sm text-heading outline-none focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Lưu tên"
              className={iconBtn}
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              aria-label="Hủy đổi tên"
              onClick={() => {
                setTitle(cv.title);
                setEditing(false);
              }}
              className={iconBtn}
            >
              <X size={16} />
            </button>
          </form>
        ) : (
          <p className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-heading">
              {cv.title}
            </span>
            {cv.isDefault && (
              <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                Mặc định
              </span>
            )}
          </p>
        )}
        <p
          className="mt-0.5 truncate text-xs text-gray-400"
          title={cv.fileName}
        >
          {meta}
        </p>
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5">
          <a
            href={cv.pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Xem ${cv.title}`}
            title="Xem CV"
            className={iconBtn}
          >
            <ExternalLink size={16} />
          </a>
          {!cv.isDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={onSetDefault}
              title="Đặt làm mặc định"
              aria-label="Đặt làm mặc định"
              className={iconBtn}
            >
              <Star size={16} />
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(true)}
            title="Đổi tên"
            aria-label="Đổi tên"
            className={iconBtn}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            title="Xóa CV"
            aria-label="Xóa CV"
            className="rounded-full p-2 text-body transition hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
