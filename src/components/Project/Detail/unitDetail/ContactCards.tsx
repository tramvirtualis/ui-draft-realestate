import { useEffect, useState } from "react";
import { MessageCircle, Phone, UserRound } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import { getContacts, type ContactDto } from "../../../../services/project/contactService";

type Props = {
  projectId: number | null; // null: chưa xác định dự án thì không hiện
  compact?: boolean;
};

// Khung liên hệ của dự án: giám đốc và admin dự án, kèm tên, vai trò, số điện thoại, nút gọi và nhắn Zalo
export default function ContactCards({ projectId, compact = false }: Props) {
  const [contacts, setContacts] = useState<ContactDto[] | null>(null);

  useEffect(() => {
    if (projectId === null) return;
    let cancelled = false;
    getContacts(projectId)
      .then((list) => !cancelled && setContacts(list))
      .catch(() => !cancelled && setContacts([]));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!contacts || contacts.length === 0) return null;

  return (
    <section aria-label="Liên hệ dự án" className={compact ? "" : "rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_1px_2px_rgba(19,41,75,0.04)]"}>
      {!compact && <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy">Liên hệ dự án</h3>}
      {/* Mỗi thẻ: thông tin ở trên (tên dài thì xuống dòng), nút Gọi / Zalo ở dưới nên hiển thị đủ ở mọi độ rộng;
          dạng gọn nằm trong cột hẹp (popup giữ chỗ) nên mỗi người một hàng */}
      <ul className={`grid gap-3 ${compact ? "" : "mt-4"} ${!compact && contacts.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {contacts.map((c) => (
          <li key={`${c.phone}-${c.name}`} className="rounded-xl border border-navy/10 bg-primary-50/30 p-3">
            <div className="flex items-center gap-3">
              {c.avatarUrl ? (
                <SafeImage src={c.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700" aria-hidden>
                  <UserRound size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-sm font-semibold leading-snug text-navy">{c.name}</p>
                <p className="text-xs text-body">{c.role}</p>
                <p className="text-xs font-medium tabular-nums text-heading">{c.phone}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                aria-label={`Gọi ${c.name}`}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-success text-xs font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
              >
                <Phone size={14} aria-hidden /> Gọi
              </a>
              {c.zaloUrl && (
                <a
                  href={c.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Nhắn Zalo cho ${c.name}`}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent text-xs font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <MessageCircle size={14} aria-hidden /> Zalo
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
