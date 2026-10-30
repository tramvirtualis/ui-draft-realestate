import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminEventService } from "../../services/event/adminEventService";
import {
  EVENT_STATUS_META,
  type EventImage,
  type EventRequest,
  type EventStatus,
} from "../../types/event/event.types";

interface FormState extends EventRequest {
  status: EventStatus;
}

const EMPTY: FormState = {
  title: "",
  content: "",
  location: "",
  maxAttendees: 0,
  startTime: "",
  endTime: "",
  status: "UPCOMING",
};
const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600 disabled:bg-gray-50";
const MAX_TITLE = 200;
const MAX_CONTENT = 500;
const MAX_LOCATION = 200;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const STATUSES = Object.keys(EVENT_STATUS_META) as EventStatus[];

// "2026-10-20T09:00:00"
const toInput = (iso: string) => iso?.slice(0, 16) ?? "";
const toApi = (local: string) => (local.length === 16 ? `${local}:00` : local);

export default function AdminEventFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const picker = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [initialStatus, setInitialStatus] = useState<EventStatus>("UPCOMING");
  const [loading, setLoading] = useState(editId !== null);
  const [saving, setSaving] = useState(false);
  // Ảnh đã lưu (chỉ khi sửa) + ảnh mới chọn từ máy
  const [saved, setSaved] = useState<EventImage[]>([]);
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>(
    []
  );

  useEffect(() => {
    if (editId === null) return;
    adminEventService
      .get(editId)
      .then((e) => {
        setForm({
          title: e.title,
          content: e.content ?? "",
          location: e.location ?? "",
          maxAttendees: e.maxAttendees,
          startTime: toInput(e.startTime),
          endTime: toInput(e.endTime),
          status: e.status,
        });
        setInitialStatus(e.status);
        setSaved(e.images);
      })
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        navigate("/admin/events");
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const visibleSaved = saved.filter((i) => !removeIds.includes(i.id));

  const pickFiles = (list: FileList | null) => {
    const all = Array.from(list ?? []);
    const files = all.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE
    );
    if (files.length < all.length)
      toast.show("Bỏ qua tệp không phải ảnh hoặc lớn hơn 10 MB", "error");
    setNewFiles((cur) => [
      ...cur,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !form.title.trim() && "tên sự kiện",
      !form.startTime && "thời gian bắt đầu",
      !form.endTime && "thời gian kết thúc",
    ].filter(Boolean);
    if (missing.length > 0) {
      toast.show(`Vui lòng bổ sung: ${missing.join(", ")}`, "error");
      return;
    }
    if (form.endTime <= form.startTime) {
      toast.show("Thời gian kết thúc phải sau thời gian bắt đầu", "error");
      return;
    }

    const request: EventRequest = {
      title: form.title.trim(),
      content: form.content.trim(),
      location: form.location.trim(),
      maxAttendees: Math.max(0, Math.floor(form.maxAttendees || 0)),
      startTime: toApi(form.startTime),
      endTime: toApi(form.endTime),
    };

    setSaving(true);
    try {
      if (editId === null) {
        await adminEventService.add(
          request,
          newFiles.map((n) => n.file)
        );
      } else {
        await adminEventService.edit(editId, request);
        if (form.status !== initialStatus)
          await adminEventService.setStatus(editId, form.status);
        await Promise.all(
          removeIds.map((imageId) =>
            adminEventService.removeImage(editId, imageId)
          )
        );
        if (newFiles.length > 0)
          await adminEventService.addImages(
            editId,
            newFiles.map((n) => n.file)
          );
      }
      toast.show(editId === null ? "Đã thêm sự kiện" : "Đã cập nhật sự kiện");
      navigate("/admin/events");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const title = editId === null ? "Thêm sự kiện" : "Sửa sự kiện";

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Quản lý sự kiện", to: "/admin/events" },
          { label: title },
        ]}
        title={title}
      />
      <div className="-mt-16 px-4 pb-10 md:px-8">
        <form
          onSubmit={submit}
          noValidate
          className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm"
          aria-busy={loading}
        >
          <label className="block text-sm font-semibold text-heading">
            Tên sự kiện <span className="text-danger">*</span>
            <input
              value={form.title}
              maxLength={MAX_TITLE}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Vd: Lễ mở bán Đất Việt Riverside"
              className={field}
              disabled={loading}
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-heading">
              Bắt đầu <span className="text-danger">*</span>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className={field}
                disabled={loading}
              />
            </label>
            <label className="block text-sm font-semibold text-heading">
              Kết thúc <span className="text-danger">*</span>
              <input
                type="datetime-local"
                value={form.endTime}
                min={form.startTime || undefined}
                onChange={(e) => set("endTime", e.target.value)}
                className={field}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem]">
            <label className="block text-sm font-semibold text-heading">
              Địa điểm
              <input
                value={form.location}
                maxLength={MAX_LOCATION}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Vd: Nhà mẫu dự án, 123 Nguyễn Văn Linh, Q.7"
                className={field}
                disabled={loading}
              />
            </label>
            <label className="block text-sm font-semibold text-heading">
              Số người tối đa
              <input
                type="number"
                min={0}
                value={form.maxAttendees}
                onChange={(e) => set("maxAttendees", Number(e.target.value))}
                className={field}
                disabled={loading}
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                0 = không giới hạn
              </span>
            </label>
          </div>

          {editId !== null && (
            <label className="block max-w-xs text-sm font-semibold text-heading">
              Trạng thái
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as EventStatus)}
                className={field}
                disabled={loading}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {EVENT_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm font-semibold text-heading">
            <span className="flex items-center justify-between">
              <span>Mô tả</span>
              <span
                className={`text-xs font-normal ${
                  form.content.length >= MAX_CONTENT
                    ? "text-danger"
                    : "text-muted"
                }`}
              >
                {form.content.length}/{MAX_CONTENT}
              </span>
            </span>
            <textarea
              value={form.content}
              maxLength={MAX_CONTENT}
              rows={5}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Giới thiệu ngắn về sự kiện, chương trình, quà tặng..."
              className={field}
              disabled={loading}
            />
          </label>

          <div>
            <span className="text-sm font-semibold text-heading">
              Hình ảnh{" "}
              <span className="text-xs font-normal text-muted">
                (Không bắt buộc, tối đa 10 MB/ảnh; ảnh đầu tiên làm ảnh bìa)
              </span>
            </span>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {visibleSaved.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imageUrl}
                    alt="Ảnh sự kiện"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveIds((cur) => [...cur, img.id])}
                    aria-label="Xóa ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newFiles.map((n, i) => (
                <div key={n.preview} className="relative">
                  <img
                    src={n.preview}
                    alt="Ảnh mới"
                    className="aspect-[4/3] w-full rounded-xl border border-dashed border-primary-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(n.preview);
                      setNewFiles((cur) => cur.filter((_, k) => k !== i));
                    }}
                    aria-label="Bỏ ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => picker.current?.click()}
                disabled={loading}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 disabled:opacity-60"
              >
                + Thêm ảnh
              </button>
            </div>
            <input
              ref={picker}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                pickFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
            >
              Hủy
            </button>
            <button
              disabled={saving || loading}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
