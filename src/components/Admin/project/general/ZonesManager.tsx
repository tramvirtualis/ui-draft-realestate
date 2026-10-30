import { useState } from "react";
import { useToast } from "../../../common/toastContext";
import { getErrorMessage } from "../../../../api";
import { adminProjectService } from "../../../../services/project/adminProjectService";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import ZoneFormDialog from "./ZoneFormDialog";
import ConfirmDialog from "../../ConfirmDialog";
import { statusTone } from "../../../Project/Detail/zones/zoneStatus";
import type { AdminZone } from "../../../../types/project/adminProject.types";

// projectId: dự án đã có thì lưu phân khu lên server ngay; chưa có (đang tạo dự án) thì lưu cùng form dự án
type Props = { zones: AdminZone[]; onChange: (zones: AdminZone[], persisted: boolean) => void; projectId?: number };

const COLUMNS = ["Ảnh", "Tên phân khu", "Mô tả", "Trạng thái", "Hành động"];

// Quản lý phân khu của dự án
export default function ZonesManager({ zones, onChange, projectId }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminZone | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminZone | null>(null);

  const save = async (data: Pick<AdminZone, "name" | "description" | "status" | "imageUrl" | "imageFile">) => {
    if (!editing) return;
    const draft: AdminZone = editing === "new" ? { ...data, id: -Date.now() } : { ...editing, ...data }; // id tạm <= 0
    if (projectId) {
      setBusy(true);
      try {
        const saved = await adminProjectService.saveZone(projectId, draft);
        onChange(editing === "new" ? [...zones, saved] : zones.map((z) => (z.id === draft.id ? saved : z)), true);
        toast.show(editing === "new" ? "Đã thêm phân khu" : "Đã lưu phân khu");
        setEditing(null);
      } catch (e) {
        toast.show(getErrorMessage(e), "error");
      } finally {
        setBusy(false);
      }
      return;
    }
    onChange(editing === "new" ? [...zones, draft] : zones.map((z) => (z.id === draft.id ? draft : z)), false);
    setEditing(null);
  };

  const remove = async (zone: AdminZone) => {
    if (projectId && zone.id > 0) {
      try {
        await adminProjectService.removeZone(zone.id);
        toast.show("Đã xóa phân khu");
      } catch (e) {
        toast.show(getErrorMessage(e), "error");
        setDeleting(null);
        return;
      }
    }
    onChange(zones.filter((z) => z.id !== zone.id), !!projectId);
    setDeleting(null);
  };

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-footer">Quản lý phân khu</h2>
          <p className="mt-1 text-sm text-body">Thêm, chỉnh sửa hoặc xóa phân khu của dự án.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
        >
          <Plus size={16} /> Thêm phân khu
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="text-xs text-body">
              {COLUMNS.map((c) => (
                <th key={c} scope="col" className="bg-primary-50/60 px-4 py-2.5 font-semibold first:rounded-l-lg last:rounded-r-lg">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="[&>td]:border-y [&>td]:border-line [&>td:first-child]:rounded-l-lg [&>td:first-child]:border-l [&>td:last-child]:rounded-r-lg [&>td:last-child]:border-r">
                <td className="px-4 py-3.5">
                  {z.imageUrl ? (
                    <SafeImage src={z.imageUrl} alt={z.name} className="h-12 w-16 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-primary-50 text-[10px] text-muted">Chưa có</span>
                  )}
                </td>
                <td className="px-4 py-3.5 font-semibold text-footer">{z.name}</td>
                <td className="max-w-[320px] truncate px-4 py-3.5 text-body" title={z.description}>{z.description || "—"}</td>
                <td className="px-4 py-3.5">
                  {z.status ? <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusTone(z.status).badge}`}>{z.status}</span> : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setEditing(z)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-primary-50">Chỉnh sửa</button>
                    <button type="button" onClick={() => setDeleting(z)} aria-label={`Xóa ${z.name}`} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.length === 0 && <p className="rounded-xl border border-dashed border-primary-200 bg-primary-50/50 px-4 py-8 text-center text-sm text-body">Dự án chưa có phân khu nào.</p>}
      </div>

      <p className="mt-3 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-xs text-warning">
        <AlertTriangle size={14} className="shrink-0" /> Lưu ý: Chỉ có thể xóa phân khu trống. Nếu phân khu đang chứa tòa nhà, căn hộ hoặc bảng hàng, vui lòng xóa hoặc chuyển các mục đó trước.
      </p>

      {editing && <ZoneFormDialog zone={editing === "new" ? null : editing} onSave={(d) => void save(d)} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa phân khu?"
          message={`Bạn có chắc chắn muốn xóa phân khu "${deleting.name}" không? Lưu ý: Phân khu phải trống (không còn tòa nhà, căn hộ hoặc bảng hàng). Hành động này không thể hoàn tác.`}
          onConfirm={() => void remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
