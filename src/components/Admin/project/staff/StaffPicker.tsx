import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { adminStaffService } from "../../../../services/project/staffService";
import type { StaffCandidate, StaffMember, StaffType } from "../../../../types/project/staff.types";

type Props = {
  type: StaffType;
  excludeIds: number[]; // đã thuộc dự án
  busy: boolean;
  onPick: (member: StaffMember) => void;
};

const DEBOUNCE_MS = 300;

// Ô tìm tài khoản theo tên (không phân biệt dấu) để thêm vào dự án; tài khoản không giao được hiện mờ kèm lý do
export default function StaffPicker({ type, excludeIds, busy, onPick }: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StaffCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const k = keyword.trim();
    if (!k) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      adminStaffService
        .candidates(type, k)
        .then((list) => !cancelled && setResults(list))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [keyword, type]);

  const visible = (results ?? []).filter((m) => !excludeIds.includes(m.userId));

  return (
    <div className="relative">
      <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-primary-600">
        {loading ? <Loader2 size={16} className="animate-spin text-muted" aria-hidden /> : <Search size={16} className="text-muted" aria-hidden />}
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm tài khoản theo tên..."
          aria-label={type === "ADMIN" ? "Tìm admin dự án" : "Tìm giám đốc dự án"}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      {results !== null && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-xl" role="listbox">
          {visible.length === 0 ? (
            <li className="px-4 py-3 text-sm text-body">Không tìm thấy tài khoản.</li>
          ) : (
            visible.map((m) => (
              <li key={m.userId}>
                <button
                  type="button"
                  disabled={busy || m.unavailableReason !== null}
                  onClick={() => {
                    onPick(m);
                    setKeyword("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition enabled:hover:bg-primary-50 disabled:cursor-not-allowed"
                >
                  <span className={`min-w-0 flex-1 ${m.unavailableReason ? "opacity-60" : ""}`}>
                    <span className="block truncate text-sm font-semibold text-heading">{m.fullName}</span>
                    <span className="block truncate text-xs text-body">{[m.email, m.phone].filter(Boolean).join(" · ")}</span>
                  </span>
                  {m.unavailableReason ? (
                    <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">{m.unavailableReason}</span>
                  ) : (
                    <UserPlus size={15} className="shrink-0 text-primary-600" aria-hidden />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
