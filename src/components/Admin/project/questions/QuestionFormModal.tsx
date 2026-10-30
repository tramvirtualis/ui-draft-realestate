import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../../../common/useFocusTrap";
import type { QuestionInput } from "../../../../services/project/questionService";
import type { QuestionDto } from "../../../../types/project/project.types";

type Props = {
  item: QuestionDto | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (input: QuestionInput) => void;
  onClose: () => void;
};

const field = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

export default function QuestionFormModal({ item, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return setError("Nhập nội dung câu hỏi");
    if (!answer.trim()) return setError("Nhập câu trả lời");
    setError("");
    onSubmit({ question, answer });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="question-form-title" className="text-xl font-bold text-footer">{item ? "Chỉnh sửa hỏi đáp" : "Thêm hỏi đáp"}</h2>
          <p className="mt-1 text-sm text-body">Nhập đầy đủ câu hỏi và câu trả lời; nội dung hiển thị ở mục "Câu hỏi thường gặp" của dự án.</p>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Câu hỏi <span className="text-danger">*</span></span>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className={`${field} mt-1.5 py-3`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Câu trả lời <span className="text-danger">*</span></span>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} className={`${field} mt-1.5 py-3`} />
          </label>
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm hỏi đáp"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
