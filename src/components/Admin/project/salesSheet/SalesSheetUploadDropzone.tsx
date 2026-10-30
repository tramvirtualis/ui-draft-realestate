import { FileUp, Loader2 } from "lucide-react";

interface Props {
  buildingName: string;
  uploading: boolean;
  onUploadClick: () => void;
}

/**
 * Mục 2: Khung tải lên bản vẽ bảng hàng khi tòa chưa có bản vẽ
 */
export default function SalesSheetUploadDropzone({
  buildingName,
  uploading,
  onUploadClick,
}: Props) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <FileUp size={32} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-footer">
        2. Tải lên bản vẽ bảng hàng tòa {buildingName}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-xs text-body">
        Nên dùng file Excel (.xlsx): bảng hàng hiển thị giống hệt Excel và phóng to vẫn nét.
        Vẫn hỗ trợ file PDF (tối đa 100 MB) hoặc ảnh PNG / JPG (tối đa 50 MB).
      </p>
      <button
        type="button"
        disabled={uploading}
        onClick={onUploadClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary-200 transition hover:bg-primary-700 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileUp size={16} />
        )}
        Tải lên file Excel / PDF / Ảnh bảng hàng
      </button>
    </div>
  );
}
