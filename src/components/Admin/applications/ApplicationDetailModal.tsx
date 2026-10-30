import { useEffect, useState } from "react";
import { FileText, Mail, Phone, Trash2 } from "lucide-react";
import AdminModal from "../AdminModal";
import { useToast } from "../../common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminApplicationService } from "../../../services/job/adminApplicationService";
import { formatDate, formatTime } from "../../../utils/formatDate";
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
  type ApplicationStatusRequest,
} from "../../../types/applicationHistory.types";

const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600 disabled:bg-gray-50";
// Admin không được chuyển đơn sang "Đã rút" (chỉ ứng viên tự rút)
const ADMIN_STATUSES: ApplicationStatus[] = APPLICATION_STATUS_ORDER.filter(
  (s) => s !== "WITHDRAWN"
);

const when = (iso: string) => `${formatTime(iso)} · ${formatDate(iso)}`;
const fileSize = (bytes?: number | null) =>
  bytes
    ? bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`
    : "";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}

// API xem / đổi trạng thái đơn: admin (/admin/applications) hoặc nhà tuyển dụng (/employer/applications)
export interface ApplicationApi {
  get: (id: number) => Promise<Application>;
  setStatus: (
    id: number,
    request: ApplicationStatusRequest
  ) => Promise<Application>;
}

export default function ApplicationDetailModal({
  id,
  onClose,
  onChanged,
  onDelete,
  service = adminApplicationService,
}: {
  id: number;
  onClose: () => void;
  onChanged: () => void;
  // Không truyền thì ẩn nút xóa (nhà tuyển dụng không xóa đơn)
  onDelete?: (app: Application) => void;
  service?: ApplicationApi;
}) {
  const toast = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("REVIEWING");
  const [note, setNote] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [interviewAt, setInterviewAt] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const fill = (a: Application) => {
    setApp(a);
    const next =
      ADMIN_STATUSES[ADMIN_STATUSES.indexOf(a.status) + 1] ?? a.status;
    setStatus(a.status === "WITHDRAWN" ? a.status : next);
    setNote("");
    setAdminNote(a.adminNote ?? "");
    setInterviewAt(a.interviewAt?.slice(0, 16) ?? "");
    setInterviewLocation(a.interviewLocation ?? "");
  };

  useEffect(() => {
    service
      .get(id)
      .then(fill)
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        onClose();
      });
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    if (status === app.status) {
      toast.show(
        "Đơn đang ở trạng thái này rồi, hãy chọn trạng thái khác",
        "error"
      );
      return;
    }
    if (status === "INTERVIEW_SCHEDULED" && !interviewAt) {
      toast.show("Vui lòng nhập thời gian phỏng vấn", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await service.setStatus(app.id, {
        status,
        note: note.trim() || undefined,
        adminNote: adminNote.trim(),
        interviewAt:
          status === "INTERVIEW_SCHEDULED" && interviewAt
            ? `${interviewAt}:00`
            : undefined,
        interviewLocation:
          status === "INTERVIEW_SCHEDULED"
            ? interviewLocation.trim()
            : undefined,
      });
      toast.show(
        `Đã chuyển đơn sang "${APPLICATION_STATUS_META[status].label}"`
      );
      fill(updated.statusLogs ? updated : await service.get(app.id));
      onChanged();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const logs = [...(app?.statusLogs ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const locked = app?.status === "WITHDRAWN";

  return (
    <AdminModal
      title={app ? `Đơn của ${app.fullName}` : "Đơn ứng tuyển"}
      onClose={onClose}
    >
      {!app ? (
        <div className="animate-pulse space-y-3 p-6" aria-busy="true">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-10 rounded-xl bg-primary-50" />
          ))}
        </div>
      ) : (
        <div className="space-y-5 p-6">
          {/* Ứng viên */}
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-heading">
                {app.job?.title ?? "Tin đã bị xóa"}
              </p>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-muted">
              Nộp lúc {when(app.createdAt)}
              {app.sources ? ` · Biết tin qua: ${app.sources}` : ""}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
              <a
                href={`mailto:${app.email}`}
                className="flex items-center gap-1.5 text-primary-700 hover:underline"
              >
                <Mail size={14} /> {app.email}
              </a>
              <a
                href={`tel:${app.phone}`}
                className="flex items-center gap-1.5 text-primary-700 hover:underline"
              >
                <Phone size={14} /> {app.phone}
              </a>
            </div>
            {app.cvUrl && (
              <a
                href={app.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition hover:border-primary-300 hover:bg-primary-50/50"
              >
                <FileText size={18} className="shrink-0 text-primary-600" />
                <span className="min-w-0 flex-1 truncate font-medium text-heading">
                  {app.cvFileName || "Xem CV"}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {fileSize(app.cvFileSize)}
                </span>
              </a>
            )}
            {app.coverLetter && (
              <div className="rounded-xl bg-primary-50/50 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase text-muted">
                  Thư giới thiệu
                </p>
                <p className="mt-1 whitespace-pre-line text-body">
                  {app.coverLetter}
                </p>
              </div>
            )}
          </div>

          {/* Đổi trạng thái */}
          {locked ? (
            <p className="rounded-xl bg-line/60 px-4 py-3 text-sm text-body">
              Ứng viên đã rút đơn nên không đổi trạng thái được nữa.
            </p>
          ) : (
            <form
              onSubmit={save}
              noValidate
              className="space-y-3 rounded-2xl border border-line p-4"
            >
              <p className="text-sm font-bold text-footer">
                Cập nhật trạng thái
              </p>
              <label className="block text-sm font-semibold text-heading">
                Trạng thái mới
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ApplicationStatus)
                  }
                  className={field}
                >
                  {ADMIN_STATUSES.map((s) => (
                    <option key={s} value={s} disabled={s === app.status}>
                      {APPLICATION_STATUS_META[s].label}
                      {s === app.status ? " (hiện tại)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {status === "INTERVIEW_SCHEDULED" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-heading">
                    Thời gian phỏng vấn <span className="text-danger">*</span>
                    <input
                      type="datetime-local"
                      value={interviewAt}
                      onChange={(e) => setInterviewAt(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-heading">
                    Địa điểm / link
                    <input
                      value={interviewLocation}
                      maxLength={255}
                      onChange={(e) => setInterviewLocation(e.target.value)}
                      placeholder="Vd: Tầng 5, 123 Lê Lợi hoặc link Meet"
                      className={field}
                    />
                  </label>
                </div>
              )}
              <label className="block text-sm font-semibold text-heading">
                Lời nhắn cho ứng viên{" "}
                <span className="text-xs font-normal text-muted">
                  (ứng viên thấy trong lịch sử đơn)
                </span>
                <textarea
                  value={note}
                  rows={2}
                  onChange={(e) => setNote(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block text-sm font-semibold text-heading">
                Ghi chú nội bộ{" "}
                <span className="text-xs font-normal text-muted">
                  (ứng viên không thấy)
                </span>
                <textarea
                  value={adminNote}
                  rows={2}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className={field}
                />
              </label>
              <div className="flex justify-end">
                <button
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          )}

          {/* Lịch sử */}
          {logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-footer">Lịch sử xử lý</p>
              <ol className="mt-2 space-y-3 border-l-2 border-primary-100 pl-4">
                {logs.map((l) => (
                  <li key={l.id} className="relative text-sm">
                    <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white" />
                    <p className="text-heading">
                      {l.fromStatus
                        ? `${APPLICATION_STATUS_META[l.fromStatus].label} → `
                        : ""}
                      <span className="font-semibold">
                        {APPLICATION_STATUS_META[l.toStatus].label}
                      </span>
                      <span className="ml-2 text-xs text-muted">
                        {when(l.createdAt)}
                      </span>
                    </p>
                    {l.interviewAt && (
                      <p className="text-xs text-body">
                        Phỏng vấn {when(l.interviewAt)}
                        {l.interviewLocation
                          ? ` tại ${l.interviewLocation}`
                          : ""}
                      </p>
                    )}
                    {l.note && <p className="text-xs text-body">“{l.note}”</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex justify-between border-t border-line pt-4">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(app)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10"
              >
                <Trash2 size={15} /> Xóa đơn
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-5 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </AdminModal>
  );
}
