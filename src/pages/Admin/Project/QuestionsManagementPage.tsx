import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircleQuestion, Pencil, Plus, Search, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import QuestionFormModal from "../../../components/Admin/project/questions/QuestionFormModal";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { questionService, type QuestionInput } from "../../../services/project/questionService";
import { formatDate } from "../../../utils/formatDate";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { QuestionDto } from "../../../types/project/project.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import TableSkeleton from "../../../components/common/TableSkeleton";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type FormState = { item: QuestionDto | null } | null;
// Quản lý hỏi đáp của từng dự án (bảng Questions: question, answer)
export default function QuestionsManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [items, setItems] = useState<QuestionDto[] | null>(null);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<QuestionDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((list) => {
        if (cancelled) return;
        setBoot({ status: "ready", projects: list });
      })
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (projectId === null) return;
    let cancelled = false;
    setItems(null); // đổi dự án: hiện khung chờ thay vì dữ liệu của dự án trước
    questionService
      .list(projectId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const visible = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return (items ?? []).filter(
      (q) => !k || q.question.toLowerCase().includes(k) || (q.answer ?? "").toLowerCase().includes(k),
    );
  }, [items, keyword]);

  const save = async (input: QuestionInput) => {
    if (projectId === null) return;
    setSubmitting(true);
    try {
      if (form?.item) await questionService.edit(form.item.id, projectId, input);
      else {
        await questionService.add(projectId, input);
      }
      toast.show(form?.item ? "Đã lưu thay đổi" : "Đã thêm hỏi đáp");
      setForm(null);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || projectId === null) return;
    try {
      await questionService.remove(deleting.id);
      toast.show("Đã xóa hỏi đáp");
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý hỏi đáp" }]}
      title="Quản lý hỏi đáp dự án"
      desc="Thêm câu hỏi thường gặp kèm câu trả lời cho từng dự án; hiển thị ở mục FAQ của trang chi tiết dự án."
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="animate-pulse space-y-3 px-4 pb-10 md:px-8" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-24 rounded-2xl bg-primary-50" />)}
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
            <b className="text-footer">{project?.name}</b> · {items?.length ?? 0} câu hỏi
          </p>
          <button
            onClick={() => setForm({ item: null })}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm hỏi đáp
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm câu hỏi hoặc câu trả lời..."
              aria-label="Tìm hỏi đáp"
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {items === null ? (
            <TableSkeleton rows={4} label="Đang tải hỏi đáp" />
          ) : visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">
              {items.length === 0 ? "Dự án chưa có hỏi đáp nào." : "Không có hỏi đáp phù hợp với bộ lọc."}
            </p>
          ) : (
            visible.map((q) => {
              return (
                <article key={q.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md hover:shadow-primary-100">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <MessageCircleQuestion size={18} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-footer">{q.question}</h3>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-body">{q.answer}</p>
                      <p className="mt-3 text-[11px] text-muted">Tạo ngày {formatDate(q.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => setForm({ item: q })} aria-label="Sửa hỏi đáp" title="Chỉnh sửa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-footer transition hover:bg-primary-50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(q)} aria-label="Xóa hỏi đáp" title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {form && <QuestionFormModal item={form.item} submitting={submitting} onSubmit={save} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa hỏi đáp này?"
          message="Bạn có chắc chắn muốn xóa câu hỏi này khỏi dự án không? Hành động này không thể hoàn tác."
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
