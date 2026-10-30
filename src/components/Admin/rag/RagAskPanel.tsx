import { useState, type FormEvent } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { getErrorMessage } from "../../../api";
import { adminRagService } from "../../../services/rag/adminRagService";
import type { RagAskResponse } from "../../../types/rag/rag.types";
import { SECTION_LABEL } from "./ragLabels";

type Props = { canManage: boolean };

// Số [n] AI trích trong câu trả lời
const citedIndexes = (answer: string) => new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));

// Tab Hỏi thử: hỏi như khách để kiểm tra AI trả lời đúng chưa, lấy từ những đoạn nào, độ giống bao nhiêu
export default function RagAskPanel({ canManage }: Props) {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<RagAskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setError(null);
    try {
      setResult(await adminRagService.ask(question.trim()));
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setAsking(false);
    }
  };

  const cited = result ? citedIndexes(result.answer) : new Set<number>();

  return (
    <div className="space-y-5">
      <form onSubmit={(e) => void submit(e)} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <label htmlFor="rag-question" className="text-sm font-semibold text-heading">Câu hỏi</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <textarea
            id="rag-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={1000}
            rows={2}
            placeholder="VD: Dự án nào gần trường học? Thủ tục đặt cọc thế nào?"
            disabled={!canManage}
            className="min-h-[52px] flex-1 resize-y rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!canManage || asking || !question.trim()}
            className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-50"
          >
            {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Hỏi
          </button>
        </div>
        <p className="mt-2 text-xs text-body">
          {canManage
            ? "Không giới hạn lượt như khách, nhưng mỗi câu vẫn tốn 1 lượt gọi AI."
            : "Cần quyền quản lý trợ lý AI (RAG_MANAGE) để hỏi thử."}
        </p>
      </form>

      {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>}

      {result && (
        <>
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Bot size={18} className="text-primary-600" />
              <h2 className="font-semibold text-heading">Câu trả lời</h2>
              {!result.usedLlm && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700" title="Câu chào hỏi, hoặc không có đoạn nào đủ giống câu hỏi">
                  Câu mặc định, không gọi AI
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-heading">{result.answer}</p>
          </section>

          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-semibold text-heading">Các đoạn AI đã lấy ({result.sources.length})</h2>
              <p className="text-xs text-body">Khách chỉ thấy các nguồn được trích [n]; ở đây hiện cả nguồn lấy về nhưng không dùng.</p>
            </div>
            {result.sources.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-body">Không tìm thấy đoạn nào đủ giống câu hỏi.</p>
            ) : (
              <ul className="divide-y divide-line">
                {result.sources.map((s) => (
                  <li key={s.index} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cited.has(s.index) ? "bg-primary-600 text-white" : "bg-gray-100 text-body"}`}>
                      {s.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-heading">
                        <span className="mr-2 text-xs font-semibold text-body">{s.type === "DOCUMENT" ? "Tài liệu" : "Dự án"}</span>
                        {s.title ?? `#${s.id}`}
                      </p>
                      <p className="truncate text-xs text-body">
                        {[s.section && (SECTION_LABEL[s.section] ?? s.section), s.heading, s.page != null && `Trang ${s.page}`].filter(Boolean).join(" · ")}
                        {!cited.has(s.index) && " · không được trích"}
                      </p>
                    </div>
                    <div className="flex w-36 items-center gap-2" title="Độ giống câu hỏi (cosine)">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.round(s.score * 100)}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold tabular-nums text-heading">{s.score.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
