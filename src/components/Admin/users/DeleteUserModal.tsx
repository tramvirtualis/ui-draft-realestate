import { useState } from "react";
import { AlertTriangle, Search, Trash2 } from "lucide-react";
import UserModalShell from "./UserModalShell";
import type { AdminUser } from "../../../data/mockAdminUsers";

type Props = {
  user: AdminUser;
  candidates: AdminUser[]; // người có thể nhận chuyển quyền (không gồm chính người bị xóa)
  onConfirm: (transferToId: number | null) => void;
  onClose: () => void;
};

type Mode = "archive" | "transfer";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase();

export default function DeleteUserModal({ user, candidates, onConfirm, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("archive");
  const [query, setQuery] = useState("");
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [understood, setUnderstood] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = candidates.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 4);
  const ready = understood && (mode === "archive" || receiverId !== null);

  const options: { key: Mode; title: string; desc: string }[] = [
    { key: "archive", title: "Giữ dữ liệu dưới dạng lưu trữ", desc: "Nội dung được giữ lại nhưng không còn chủ sở hữu." },
    { key: "transfer", title: "Chuyển quyền sở hữu", desc: "Chuyển nội dung và tác vụ đang phụ trách cho người khác." },
  ];

  return (
    <UserModalShell
      title="Xóa người dùng"
      desc="Hành động này không thể hoàn tác. Hãy kiểm tra kỹ trước khi tiếp tục."
      icon={Trash2}
      tone="danger"
      onClose={onClose}
      onSubmit={() => ready && onConfirm(mode === "transfer" ? receiverId : null)}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button
            type="submit"
            disabled={!ready}
            className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} /> Xóa người dùng
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl bg-danger/10 px-4 py-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-danger">Tài khoản sẽ bị xóa vĩnh viễn</p>
          <p className="mt-0.5 text-xs text-body">Người dùng mất quyền truy cập ngay lập tức. Nhật ký hoạt động vẫn được lưu theo chính sách hệ thống.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-primary-50/50 px-4 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-xs font-bold text-primary-700">{initials(user.name)}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-footer">{user.name}</p>
          <p className="truncate text-xs text-body">{user.email}</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[11px] font-semibold uppercase tracking-wide text-muted">Xử lý dữ liệu và quyền sở hữu</legend>
        <div className="mt-3 space-y-3">
          {options.map((o) => (
            <label
              key={o.key}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                mode === o.key ? "border-primary-500 bg-primary-50" : "border-line bg-white hover:bg-primary-50/50"
              }`}
            >
              <input type="radio" name="delete-mode" checked={mode === o.key} onChange={() => setMode(o.key)} className="mt-1 accent-primary-600" />
              <span>
                <span className="block text-sm font-semibold text-footer">{o.title}</span>
                <span className="block text-xs text-body">{o.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-footer" htmlFor="transfer-search">Người nhận chuyển quyền</label>
        <div className="relative mt-1.5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="transfer-search"
            value={query}
            disabled={mode !== "transfer"}
            onChange={(e) => {
              setQuery(e.target.value);
              setReceiverId(null);
            }}
            placeholder="Tìm theo tên hoặc email"
            className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:bg-primary-50/50"
          />
        </div>
        <p className="mt-1.5 text-xs text-body">Chỉ khả dụng khi chọn "Chuyển quyền sở hữu".</p>

        {mode === "transfer" && matches.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-xl border border-line">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setReceiverId(c.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-primary-50 ${receiverId === c.id ? "bg-primary-50" : ""}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">{initials(c.name)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-footer">{c.name}</span>
                    <span className="block truncate text-xs text-body">{c.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="h-4 w-4 accent-primary-600" />
        <span className="text-sm text-footer">Tôi hiểu rằng tài khoản này sẽ bị xóa vĩnh viễn</span>
      </label>
    </UserModalShell>
  );
}
