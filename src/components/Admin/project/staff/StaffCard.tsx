import type { ReactNode } from "react";
import { AlertTriangle, Trash2, UserRound } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import type { StaffMember } from "../../../../types/project/staff.types";

type Props = {
  title: string;
  members: StaffMember[];
  canEdit: boolean; // được thêm tài khoản
  canRemove?: boolean; // được gỡ tài khoản, mặc định như canEdit
  picker?: ReactNode; // ô thêm tài khoản (khi được phép)
  note?: string; // giải thích quyền (hiện khi không được thêm, hoặc được thêm nhưng không được gỡ)
  onRemove: (member: StaffMember) => void;
};

// Một nhóm nhân sự của dự án: danh sách tài khoản, ô thêm và nút gỡ
export default function StaffCard({ title, members, canEdit, canRemove = canEdit, picker, note, onRemove }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line p-5">
        <h2 className="font-semibold text-footer">
          {title} <span className="text-xs font-normal text-muted">({members.length})</span>
        </h2>
      </div>

      <div className="space-y-3 p-5">
        {canEdit && picker}
        {(!canEdit || !canRemove) && note && <p className="rounded-xl bg-primary-50/60 px-4 py-3 text-xs text-body">{note}</p>}

        {members.length === 0 ? (
          <p className="py-6 text-center text-sm text-body">Chưa có ai.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {members.map((m) => (
              <li key={m.userId} className="flex items-center gap-3 px-4 py-3">
                {m.avatarUrl ? (
                  <SafeImage src={m.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white" aria-hidden>
                    <UserRound size={17} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">{m.fullName}</p>
                  <p className="truncate text-xs text-body">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
                  {!m.phone && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-warning">
                      <AlertTriangle size={11} aria-hidden /> Chưa có số điện thoại: không hiện ở form booking
                    </p>
                  )}
                </div>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(m)}
                    aria-label={`Gỡ ${m.fullName}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-body transition hover:bg-danger/5 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
