import { Loader2 } from "lucide-react";

type Props = {
  rows?: number;
  label?: string;
};

/**
 Khung giữ chỗ nhấp nháy (animate-pulse) kèm vòng quay ở giữa khi chờ dữ liệu bảng:
 dùng lúc mới vào trang và khi đổi trang / bộ lọc.
 Số dòng nên bằng số dòng mỗi trang để chiều cao không đổi, dữ liệu về không bị giật.
   {loading ? <TableSkeleton rows={PAGE_SIZE} /> : <Table />}
 */
export default function TableSkeleton({ rows = 5, label = "Đang tải..." }: Props) {
  return (
    <div className="relative" role="status" aria-busy="true" aria-label={label}>
      <div className="animate-pulse space-y-3 p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-16 rounded-xl bg-primary-50" />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-line">
          <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
        </span>
      </div>
    </div>
  );
}
