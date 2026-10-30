import { Link } from "react-router-dom";
import { Eye, ImageOff, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatTime } from "../../../utils/formatDate";
import { htmlToText } from "../../../utils/richText";
import type { News } from "../../../types/new/news.types";

type Props = {
  items: News[];
  busyId?: number | null;
  onToggleActive: (news: News) => void;
  onDelete: (news: News) => void;
};

const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";

// Bỏ thẻ HTML / xuống dòng để lấy đoạn tóm tắt hiển thị dưới tiêu đề
const summarize = (content: string) => {
  const text = htmlToText(content ?? "");
  return text.length > 110 ? `${text.slice(0, 110)}…` : text;
};

const TH =
  "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

export default function NewsTable({
  items,
  busyId = null,
  onToggleActive,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className={TH}>Bài viết</th>
            <th className={TH}>Chuyên mục</th>
            <th className={TH}>Dự án</th>
            <th className={TH}>Tác giả</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Cập nhật</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {items.map((n) => {
            const cover = n.images?.[0]?.imageUrl;
            const updated = n.updatedAt ?? n.createdAt;
            return (
              <tr
                key={n.id}
                className="border-t border-line transition hover:bg-primary-50/40"
              >
                <td className="max-w-[380px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
                        <ImageOff size={20} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        className="truncate font-semibold text-footer"
                        title={n.title}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-body">
                        {summarize(n.content)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-heading">
                  {(n.categories?.length
                    ? n.categories
                    : n.category
                    ? [n.category]
                    : []
                  )
                    .map((c) => c.name)
                    .join(", ") || "—"}
                </td>
                <td
                  className="max-w-[160px] truncate px-4 py-3 text-heading"
                  title={n.project?.name}
                >
                  {n.project?.name ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-heading">
                  {n.author?.fullName ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleActive(n)}
                    disabled={busyId === n.id}
                    title={n.active ? "Bấm để ẩn tin" : "Bấm để hiển thị tin"}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${
                      n.active
                        ? "bg-success/10 text-success"
                        : "bg-line text-body"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.active ? "bg-success" : "bg-muted"
                      }`}
                    />
                    {n.active ? "Đang hiển thị" : "Đang ẩn"}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                  {formatDate(updated)} · {formatTime(updated)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {n.active && (
                      <Link
                        to={`/news/${n.id}`}
                        target="_blank"
                        aria-label={`Xem ${n.title}`}
                        title="Xem trên website"
                        className={`${btn} text-body hover:bg-primary-50`}
                      >
                        <Eye size={16} />
                      </Link>
                    )}
                    <Link
                      to={`/admin/news/${n.id}/edit`}
                      aria-label={`Sửa ${n.title}`}
                      title="Sửa"
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => onDelete(n)}
                      aria-label={`Xóa ${n.title}`}
                      title="Xóa"
                      className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
