import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import useFocusTrap from "../../../components/common/useFocusTrap";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { projectDocumentService, type DocumentInput } from "../../../services/project/projectDocumentService";
import { formatDate } from "../../../utils/formatDate";
import type { ProjectDocument } from "../../../services/project/projectExtrasService";
import type { AdminProject } from "../../../types/project/adminProject.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import TableSkeleton from "../../../components/common/TableSkeleton";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };

const field = "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

function DocumentFormModal({ submitting, onSubmit, onClose }: { submitting: boolean; onSubmit: (input: DocumentInput) => void; onClose: () => void }) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Nhập tên tài liệu");
    if (!/^https?:\/\//i.test(url.trim())) return setError("Đường dẫn phải bắt đầu bằng http:// hoặc https://");
    setError("");
    onSubmit({ title, url });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="document-form-title" className="text-xl font-bold text-footer">Thêm tài liệu</h2>
          <p className="mt-1 text-sm text-body">Nhập tên và đường dẫn tới tệp tài liệu (PDF, Drive...).</p>
        </div>
        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên tài liệu <span className="text-danger">*</span></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={`${field} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Đường dẫn <span className="text-danger">*</span></span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={`${field} mt-1.5`} />
          </label>
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : "Thêm tài liệu"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

// Quản lý tài liệu của từng dự án (bảng Project_Documents: title, url)
export default function ProjectDocumentsManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [items, setItems] = useState<ProjectDocument[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<ProjectDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((list) => !cancelled && setBoot({ status: "ready", projects: list }))
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (projectId === null) return;
    let cancelled = false;
    setItems(null); // đổi dự án: hiện khung chờ thay vì dữ liệu của dự án trước
    projectDocumentService
      .list(projectId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const add = async (input: DocumentInput) => {
    if (projectId === null) return;
    setSubmitting(true);
    try {
      await projectDocumentService.add(projectId, input);
      toast.show("Đã thêm tài liệu");
      setAdding(false);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await projectDocumentService.remove(deleting.id);
      toast.show("Đã xóa tài liệu");
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý tài liệu dự án" }]}
      title="Quản lý tài liệu dự án"
      desc="Thêm các tài liệu chính thức (brochure, mặt bằng, pháp lý...) cho từng dự án; hiển thị tại tab Tài liệu của dự án."
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="animate-pulse space-y-3 px-4 pb-10 md:px-8" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-16 rounded-2xl bg-primary-50" />)}
        </div>
      </div>
    );
  }

  if (boot.status === "error" || projectId === null) {
    return (
      <div className="animate-page-in">
        {header()}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      {header()}
      <ProjectManageBar projectId={projectId} />

      <div className="px-4 pb-12 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-body" aria-live="polite">
            <b className="text-footer">{project?.name}</b> · {items?.length ?? 0} tài liệu
          </p>
          <button
            onClick={() => setAdding(true)}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tài liệu
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items === null ? (
            <TableSkeleton rows={4} label="Đang tải tài liệu" />
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">
              Dự án chưa có tài liệu nào.
            </p>
          ) : (
            items.map((d) => (
              <div key={d.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-footer">{d.title}</p>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-xs text-primary-600 hover:underline">
                    <ExternalLink size={12} className="shrink-0" /> <span className="truncate">{d.url}</span>
                  </a>
                </div>
                <span className="hidden text-xs text-muted sm:block">{formatDate(d.createdAt)}</span>
                <button onClick={() => setDeleting(d)} aria-label={`Xóa ${d.title}`} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {adding && <DocumentFormModal submitting={submitting} onSubmit={add} onClose={() => setAdding(false)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa tài liệu này?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
