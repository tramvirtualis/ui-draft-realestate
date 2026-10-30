import { useState } from "react";
import { ExternalLink, FileText, ImageOff } from "lucide-react";
import {
  COMPANY_DOCUMENT_LABEL,
  isPdfLink,
  type CompanyDocumentKey,
  type CompanyDocuments as Documents,
} from "../../types/job/company.types";

type Props = {
  documents: Documents | null;
  refresh: () => Promise<Documents | null>;
  onError?: (message: string) => void;
};

const KEYS: CompanyDocumentKey[] = [
  "businessLicenseUrl",
  "idCardFrontUrl",
  "idCardBackUrl",
];

function Thumb({ url, label }: { url: string | null; label: string }) {
  const [broken, setBroken] = useState(false);
  if (!url) return <ImageOff size={22} className="text-muted" aria-hidden />;
  if (isPdfLink(url))
    return <FileText size={28} className="text-primary-600" aria-hidden />;
  if (broken)
    return (
      <ImageOff
        size={22}
        className="text-muted"
        aria-label="Link xem trước đã hết hạn"
      />
    );
  return (
    <img
      src={url}
      alt={label}
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  );
}

/**
 Hiển thị 3 giấy tờ (giấy ĐKKD, CCCD 2 mặt). Bấm "Mở" luôn xin link mới rồi mới mở tab,
 nên dù để trang lâu hơn 10 phút vẫn xem được.
 */
export default function CompanyDocuments({
  documents,
  refresh,
  onError,
}: Props) {
  const [opening, setOpening] = useState<CompanyDocumentKey | null>(null);

  const open = async (key: CompanyDocumentKey) => {
    // Mở tab ngay trong lúc bấm (tránh bị chặn popup), có link mới thì chuyển tab tới đó
    const tab = window.open("", "_blank");
    setOpening(key);
    try {
      const fresh = await refresh();
      const url = fresh?.[key];
      if (!url) throw new Error("Không lấy được link giấy tờ");
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch (err) {
      tab?.close();
      onError?.(err instanceof Error ? err.message : "Không mở được giấy tờ");
    } finally {
      setOpening(null);
    }
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {KEYS.map((key) => (
        <li
          key={key}
          className="overflow-hidden rounded-2xl border border-line bg-white"
        >
          <div className="flex h-32 items-center justify-center bg-primary-50/50">
            <Thumb
              url={documents?.[key] ?? null}
              label={COMPANY_DOCUMENT_LABEL[key]}
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <p
              className="min-w-0 truncate text-xs font-semibold text-heading"
              title={COMPANY_DOCUMENT_LABEL[key]}
            >
              {COMPANY_DOCUMENT_LABEL[key]}
            </p>
            <button
              type="button"
              onClick={() => open(key)}
              disabled={opening !== null}
              className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 disabled:opacity-50"
            >
              <ExternalLink size={12} aria-hidden />{" "}
              {opening === key ? "Đang mở..." : "Mở"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
