import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileSpreadsheet, Layers } from "lucide-react";
import { salesSheetService } from "../../../../services/project/salesSheetService";
import type { SalesSheetSummary } from "../../../../types/project/salesSheet.types";

// Trang chi tiết dự án cao tầng: danh sách bảng hàng theo tòa (chỉ xem; sửa / thêm ghim ở mục Quản lý bảng hàng)
export default function ProjectSalesSheetsCard({ projectId }: { projectId: number }) {
  const [sheets, setSheets] = useState<SalesSheetSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    salesSheetService
      .getListByProject(projectId)
      .then((list) => !cancelled && setSheets(list))
      .catch(() => !cancelled && setSheets([]));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-footer">
          Bảng hàng tòa nhà {sheets && <span className="text-sm font-normal text-body">({sheets.length})</span>}
        </h2>
        <Link
          to={`/admin/project-sales-sheets?project=${projectId}`}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50"
        >
          Quản lý bảng hàng
        </Link>
      </div>

      {sheets === null ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-primary-50" aria-busy="true" />
      ) : sheets.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/50 px-4 py-8 text-center text-sm text-body">
          Dự án chưa có bảng hàng tòa nhà nào.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {sheets.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl bg-primary-50/50 p-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm"
                aria-hidden
              >
                <FileSpreadsheet size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-footer">{s.name || s.code}</p>
                <p className="flex items-center gap-1.5 text-xs text-body">
                  <Layers size={11} aria-hidden /> {s.pinCount} căn đã ghim · Phân khu {s.zoneName || "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
