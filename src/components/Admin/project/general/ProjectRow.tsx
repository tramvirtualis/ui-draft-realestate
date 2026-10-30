import { Link } from "react-router-dom";
import { CalendarCheck, CalendarX, Eye, Pencil, Trash2 } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import type { AdminProject } from "../../../../types/project/adminProject.types";

type Props = {
  project: AdminProject;
  index: number;
  onDelete: (p: AdminProject) => void;
  onStatus: (p: AdminProject, status: AdminProject["status"]) => void;
  onToggleBooking: (p: AdminProject) => void;
};

const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";

export default function ProjectRow({ project: p, index, onDelete, onStatus, onToggleBooking }: Props) {
  return (
    <tr className={`border-t border-line transition hover:bg-primary-50 ${p.hidden ? "bg-line/40" : ""}`}>
      <td className="px-4 py-3 text-body first:pl-6">{String(index).padStart(2, "0")}</td>
      <td className="px-2 py-3">
        <SafeImage src={p.overviewImage ?? undefined} alt="" className="h-10 w-[72px] rounded-md object-cover" />
      </td>
      <td className="max-w-[220px] px-4 py-3">
        <p className="flex items-center gap-2 font-semibold text-footer" title={p.name}>
          <span className={`truncate ${p.hidden ? "text-body" : ""}`}>{p.name}</span>
          {p.status === "HIDDEN" && <span className="shrink-0 rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-semibold text-body">Đang ẩn</span>}
          {p.status === "ARCHIVED" && <span className="shrink-0 rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-semibold text-body">Lưu trữ</span>}
          {p.status === "PUBLISHED" && !p.bookingEnabled && <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">Ngừng nhận booking</span>}
        </p>
        {p.types.length > 0 && <p className="truncate text-xs text-body">{p.types.join(" · ")}</p>}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-body">{p.investor}</td>
      <td className="max-w-[200px] truncate px-4 py-3 text-body" title={p.location}>{p.location}</td>
      <td className="whitespace-nowrap px-4 py-3 text-body">{p.buildingType || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-body">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <Link to={`/admin/projects/${p.id}`} aria-label={`Xem ${p.name}`} title="Xem" className={`${btn} text-primary-600`}>
            <Eye size={15} />
          </Link>
          <Link to={`/admin/projects/${p.id}/edit`} aria-label={`Sửa ${p.name}`} title="Sửa" className={`${btn} text-accent`}>
            <Pencil size={15} />
          </Link>
          <select
            value={p.status}
            onChange={(e) => onStatus(p, e.target.value as AdminProject["status"])}
            aria-label={`Trạng thái hiển thị của ${p.name}`}
            title="Trạng thái hiển thị với khách (không ảnh hưởng booking cũ)"
            className="h-8 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-footer outline-none focus:border-primary-300"
          >
            <option value="PUBLISHED">Hiển thị</option>
            <option value="HIDDEN">Ẩn</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
          <button
            onClick={() => onToggleBooking(p)}
            aria-label={p.bookingEnabled ? `Tạm ngừng nhận booking ${p.name}` : `Mở nhận booking ${p.name}`}
            title={p.bookingEnabled ? "Đang nhận booking – bấm để tạm ngừng" : "Đang ngừng nhận booking – bấm để mở lại"}
            className={`${btn} ${p.bookingEnabled ? "text-success" : "text-warning"}`}
          >
            {p.bookingEnabled ? <CalendarCheck size={15} /> : <CalendarX size={15} />}
          </button>
          <button onClick={() => onDelete(p)} aria-label={`Xóa ${p.name}`} title="Xóa" className={`${btn} text-danger`}>
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
