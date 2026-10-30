import { Link } from "react-router-dom";
import { Eye, Film, Globe, ImageIcon, Lock, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { htmlToText } from "../../../utils/richText";
import { formatDate, formatTime } from "../../../utils/formatDate";
import { POST_SCOPE_LABEL, type AdminPost } from "../../../types/social/social.types";

type Props = {
  items: AdminPost[];
  busyId?: number | null;
  onToggleActive: (post: AdminPost) => void;
  onHide: (post: AdminPost) => void; // nút thùng rác: mở hộp xác nhận ẩn bài
  onView: (post: AdminPost) => void;
};

const TH = "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";

const summarize = (content: string | null) => {
  // Bài đã được admin sửa bằng trình soạn thảo là HTML nên bỏ thẻ trước khi hiện tóm tắt
  const text = htmlToText(content ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "(Không có nội dung chữ)";
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
};

export default function PostsTable({ items, busyId = null, onToggleActive, onHide, onView }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className={TH}>Bài viết</th>
            <th className={TH}>Người đăng</th>
            <th className={TH}>Phạm vi</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Ngày đăng</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const cover = p.imageUrls[0];
            const name = p.author?.fullName ?? "Người dùng";
            const isPrivate = p.scope === "PRIVATE";
            return (
              <tr key={p.id} className="border-t border-line transition hover:bg-primary-50/40">
                <td className="max-w-[400px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cover ? (
                      <img src={cover} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
                        {p.videoUrl ? <Film size={20} /> : <ImageIcon size={20} />}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-footer" title={p.content ?? undefined}>
                        {summarize(p.content)}
                      </p>
                      <p className="mt-0.5 text-xs text-body">
                        {p.imageUrls.length > 0 && `${p.imageUrls.length} ảnh`}
                        {p.imageUrls.length > 0 && p.videoUrl && " · "}
                        {p.videoUrl && "1 video"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {p.author?.avatarUrl ? (
                      <img src={p.author.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="max-w-[140px] truncate font-medium text-heading" title={name}>
                      {name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isPrivate ? "bg-warning/10 text-warning" : "bg-primary-50 text-primary-700"
                    }`}
                  >
                    {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                    {isPrivate ? "Riêng tư" : "Công khai"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleActive(p)}
                    disabled={busyId === p.id}
                    title={p.active ? "Bấm để ẩn bài" : "Bấm để hiển thị bài"}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${
                      p.active ? "bg-success/10 text-success" : "bg-line text-body"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.active ? "bg-success" : "bg-muted"}`} />
                    {p.active ? "Đang hiển thị" : "Đang ẩn"}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                  {formatDate(p.createdAt)} · {formatTime(p.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(p)}
                      aria-label={`Xem bài của ${name}`}
                      title={`Xem chi tiết (${POST_SCOPE_LABEL[p.scope]})`}
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <Eye size={16} />
                    </button>
                    <Link
                      to={`/admin/posts/${p.id}/edit`}
                      aria-label={`Sửa bài của ${name}`}
                      title="Sửa bài viết"
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <Pencil size={16} />
                    </Link>
                    {p.active ? (
                      <button
                        type="button"
                        onClick={() => onHide(p)}
                        disabled={busyId === p.id}
                        aria-label={`Ẩn bài của ${name}`}
                        title="Ẩn bài viết"
                        className={`${btn} bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50`}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleActive(p)}
                        disabled={busyId === p.id}
                        aria-label={`Hiển thị lại bài của ${name}`}
                        title="Hiển thị lại bài viết"
                        className={`${btn} bg-success/10 text-success hover:bg-success/20 disabled:opacity-50`}
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
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
