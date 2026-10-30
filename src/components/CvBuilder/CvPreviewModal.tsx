import { X } from "lucide-react";
import CvPreviewPanel from "./CvPreviewPanel";

/** Mobile/tablet: xem trước CV ở dạng modal toàn màn hình */
export default function CvPreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-50" role="dialog" aria-modal="true" aria-label="Xem trước CV">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <p className="font-medium text-heading">Xem CV</p>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1.5 text-body hover:bg-primary-50">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <CvPreviewPanel />
      </div>
    </div>
  );
}
