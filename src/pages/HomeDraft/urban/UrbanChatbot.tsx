import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { ArrowUp, Building2, ChevronRight, FileText, MapPin, RotateCcw, X } from "lucide-react";
import { MAX_QUESTION_LENGTH, useChatbot } from "../../../hooks/chat/useChatbot";
import type { ChatMessage, ChatSource } from "../../../types/chat.types";
import SafeImage from "../../../components/common/SafeImage";
import Mascot from "./Mascot";

const SUGGESTIONS = ["Dự án nào đang mở bán?", "Căn 2 phòng ngủ giá bao nhiêu?", "Chính sách hỗ trợ vay thế nào?", "Tiến độ xây dựng hiện tại?"];
const GREET_DELAY = 3500;
const ASSISTANT = "Hubtech"; // tên trợ lý hiển thị

// Giao diện khung chat của trang chủ nháp: phẳng, góc vuông, nền kem + chữ đen, nhấn xanh lá tươi, font Inter Tight
const SKIN = {
  font: '"Inter Tight", "Inter", system-ui, sans-serif',
  panel: "border border-[#101010] bg-[#f6f1e7] text-[#101010] shadow-[10px_10px_0_-2px_rgba(16,16,16,0.12)]",
  header: "bg-[#101010] text-[#f6f1e7]",
  headerLine: false,
  title: "text-sm font-semibold uppercase tracking-[0.12em] text-[#f6f1e7]",
  status: "font-mono text-[10px] uppercase tracking-wider text-[#f6f1e7]/60",
  dot: "bg-[#86efac]",
  iconBtn: "text-[#f6f1e7]/70 hover:bg-[#f6f1e7]/10 hover:text-[#f6f1e7]",
  avatar: "rounded-full bg-[#101010]",
  user: "bg-[#101010] text-[#f6f1e7]",
  bot: "border-l-2 border-[#146b43] bg-[#efe6d6] text-[#101010]/85",
  botErr: "border-l-2 border-danger bg-danger/5 text-danger",
  accentText: "text-[#146b43]",
  srcHover: "hover:text-[#146b43]",
  card: "border border-[#101010]/15 bg-[#ffffff] hover:border-[#146b43]",
  cardImg: "",
  typing: "border-l-2 border-[#146b43] bg-[#efe6d6]",
  typingDot: "rounded-full bg-[#146b43]",
  chip: "border border-[#101010] bg-transparent text-[#101010] hover:border-[#146b43] hover:bg-[#d5f5e0] hover:text-[#146b43]",
  form: "border-t border-[#101010] bg-[#f6f1e7]",
  input: "border-b border-[#101010]/30 bg-transparent text-[#101010] placeholder:text-[#101010]/45 focus:border-[#146b43]",
  send: "bg-[#101010] text-[#f6f1e7] hover:bg-[#146b43]",
  greet: "border border-[#101010] bg-[#f6f1e7] text-[#101010]/80 shadow-[6px_6px_0_-1px_rgba(16,16,16,0.12)]",
  greetClose: "rounded-full bg-[#101010] text-[#f6f1e7] hover:bg-[#146b43]",
  closeOrb: "rounded-full bg-[#101010] text-[#f6f1e7] shadow-[0_10px_30px_-10px_rgba(16,16,16,0.6)]",
  tooltip: "bg-[#101010] text-[#f6f1e7]",
};
type Skin = typeof SKIN;

const sourceHref = (s: ChatSource) => (s.type === "DOCUMENT" ? (s.slug ? `/knowledge/${s.slug}` : null) : `/projects/${s.id}`);

// Đang ở trang chi tiết dự án (/projects/:id/...) thì lấy id để bot chỉ trả lời về dự án đó
function getProjectId(pathname: string): number | undefined {
  const match = matchPath("/projects/:id/*", pathname) ?? matchPath("/projects/:id", pathname);
  const id = Number(match?.params.id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

// Nhiều đoạn của cùng 1 tài liệu / dự án được trích ([1][3]) thì gộp lại thành 1 dòng
type SourceGroup = { key: string; source: ChatSource; indexes: number[]; pages: number[] };

function groupSources(sources: ChatSource[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();
  for (const s of sources) {
    const key = `${s.type}-${s.id}`;
    const group = groups.get(key) ?? { key, source: s, indexes: [], pages: [] };
    group.indexes.push(s.index);
    if (s.page && !group.pages.includes(s.page)) group.pages.push(s.page);
    groups.set(key, group);
  }
  return [...groups.values()];
}

// Trong 1 dòng: **đậm** và số nguồn [n]
function inline(text: string, key: string, accent = "text-primary-700"): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${key}-${i}`} className="font-semibold text-heading">{part.slice(2, -2)}</strong>;
    if (/^\[\d+\]$/.test(part)) return <sup key={`${key}-${i}`} className={`ml-0.5 text-[10px] font-bold ${accent}`}>{part}</sup>;
    return part;
  });
}

// Markdown tối giản của bot: đoạn văn + gạch đầu dòng
function answer(text: string, accent?: string): ReactNode[] {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    const items = list;
    out.push(<ul key={`ul-${out.length}`} className="list-disc space-y-1 pl-5 marker:text-primary-500">{items.map((t, i) => <li key={i}>{inline(t, `li${out.length}${i}`, accent)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) return void list.push(bullet[1]);
    flush();
    if (line) out.push(<p key={`p-${i}`}>{inline(line, `p${i}`, accent)}</p>);
  });
  flush();
  return out;
}

// Robot màu sáng đặt trên huy hiệu tròn navy để nổi trên nền kem của khung chat
function BotAvatar({ size, mood, skin }: { size: number; mood?: "happy" | "thinking"; skin: Skin }) {
  return (
    <span className={`flex shrink-0 items-center justify-center self-start ${skin.avatar}`} style={{ width: size + 8, height: size + 8 }}>
      <Mascot size={size} mood={mood} />
    </span>
  );
}

function Bubble({ m, skin }: { m: ChatMessage; skin: Skin }) {
  if (m.role === "user") {
    return (
      <li className="flex justify-end animate-[hd-msg-in_0.35s_ease-out]">
        <p className={`max-w-[85%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm ${skin.user}`}>{m.content}</p>
      </li>
    );
  }
  // Dự án đã có thẻ riêng (ảnh + link) thì không lặp lại trong danh sách nguồn
  const projectIds = new Set(m.projects?.map((p) => p.id));
  const sources = m.sources?.filter((s) => !(s.type === "PROJECT" && projectIds.has(s.id))) ?? [];
  return (
    <li className="flex gap-2.5 animate-[hd-msg-in_0.35s_ease-out]">
      <BotAvatar size={30} skin={skin} />
      <div className="min-w-0 max-w-[85%] space-y-2">
        <div className={`space-y-2 break-words px-4 py-3 text-sm leading-6 ${m.error ? skin.botErr : skin.bot}`}>
          {answer(m.content, skin.accentText)}
          {sources.length > 0 && (
            <div className="border-t border-line pt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Nguồn tham khảo</p>
              <ul className="space-y-1">
                {groupSources(sources).map(({ key, source: s, indexes, pages }) => {
                  const href = sourceHref(s);
                  const label = (
                    <>
                      <span className={`shrink-0 font-bold ${skin.accentText}`}>{indexes.map((i) => `[${i}]`).join("")}</span>
                      {s.type === "DOCUMENT" ? <FileText size={12} className="shrink-0" /> : <Building2 size={12} className="shrink-0" />}
                      <span className="truncate">
                        {s.title}
                        {pages.length > 0 ? ` · trang ${[...pages].sort((a, b) => a - b).join(", ")}` : ""}
                      </span>
                    </>
                  );
                  return (
                    <li key={key}>
                      {href ? <Link to={href} className={`flex items-center gap-1.5 text-xs text-body ${skin.srcHover}`}>{label}</Link> : <span className="flex items-center gap-1.5 text-xs text-body">{label}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {m.projects?.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className={`group flex items-center gap-3 p-2 transition ${skin.card}`}>
            {p.image ? <SafeImage src={p.image} alt="" loading="lazy" className={`h-14 w-18 shrink-0 object-cover ${skin.cardImg}`} /> : <span className={`flex h-14 w-18 shrink-0 items-center justify-center bg-page ${skin.cardImg}`}><Building2 size={16} className="text-muted" /></span>}
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-semibold text-heading">{p.name}</span>
              {p.location && <span className="mt-0.5 flex items-center gap-1 text-xs text-muted"><MapPin size={11} className="shrink-0" /> <span className="truncate">{p.location}</span></span>}
              <span className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${skin.accentText}`}>Xem dự án <ChevronRight size={12} /></span>
            </span>
          </Link>
        ))}
      </div>
    </li>
  );
}

// Trợ lý AI ở góc dưới, dùng chung cho mọi trang người dùng (logic chatbot thật useChatbot):
// linh vật robot hoạt hình (chớp mắt, nhìn theo chuột, vẫy tay chào), lời chào bật lên sau vài giây, khung chat kính bung ra
// từ góc, tin nhắn trượt vào, robot đổi mặt "đang suy nghĩ" khi chờ trả lời, gợi ý câu hỏi nhanh.
// Ở trang chi tiết dự án thì bot chỉ trả lời về dự án đó; ở trang chi tiết việc làm thì nâng cụm chat lên trên thanh "Ứng tuyển" (mobile)
export default function UrbanChatbot() {
  const skin = SKIN;
  const { pathname } = useLocation();
  const projectId = getProjectId(pathname);
  const aboveApplyBar = !!matchPath("/jobs/:id", pathname) && pathname !== "/jobs/create-cv";
  const { messages, sending, ask, reset } = useChatbot(projectId);
  const [open, setOpen] = useState(false);
  const [greet, setGreet] = useState(false);
  const [text, setText] = useState("");
  const [hover, setHover] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Lời chào nhỏ bật lên một lần sau vài giây nếu chưa mở chat
  useEffect(() => {
    const t = window.setTimeout(() => setGreet(true), GREET_DELAY);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    setGreet(false);
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Tin mới / đang trả lời: cuộn xuống cuối
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const send = (q: string) => {
    if (!q.trim() || sending) return;
    void ask(q);
    setText("");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div
      data-above-bar={aboveApplyBar || undefined}
      className="hd-dark-island fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 md:bottom-7 md:right-7"
      style={{ fontFamily: skin.font }}
    >
      {open && (
        <section
          role="dialog"
          aria-label={`Trợ lý AI ${ASSISTANT}`}
          // Cao tối đa = màn hình trừ thanh menu trên cùng (~5.5rem), nút mở + khoảng cách (~6rem) và lề dưới, để không đè lên menu
          // Khung chat nền sáng (kem / trắng) theo màu chung của site; dùng thẳng màu của site vì cụm chatbot nằm trong hd-dark-island
          className={`flex h-[min(620px,calc(100svh-13rem))] w-[min(400px,calc(100vw-2.5rem))] origin-bottom-right animate-[hd-chat-open_0.45s_cubic-bezier(0.2,0.8,0.2,1.2)] flex-col overflow-hidden ${skin.panel}`}
        >
          <header className={`relative flex items-center gap-3 px-4 py-3.5 ${skin.header}`}>
            {skin.headerLine && <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary-400 to-transparent" aria-hidden />}
            <BotAvatar size={38} mood={sending ? "thinking" : "happy"} skin={skin} />
            <div className="min-w-0 flex-1">
              <p className={skin.title}>TRỢ LÝ {ASSISTANT.toUpperCase()}</p>
              <p className={`flex items-center gap-1.5 ${skin.status}`}>
                <span className="relative flex h-2 w-2"><span className={`absolute inset-0 animate-ping rounded-full ${skin.dot}`} /><span className={`relative h-2 w-2 rounded-full ${skin.dot}`} /></span>
                {sending ? "Đang suy nghĩ..." : projectId ? "Đang hỏi về dự án bạn đang xem" : "Trực tuyến · trả lời ngay"}
              </p>
            </div>
            <button type="button" onClick={reset} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" className={`flex h-9 w-9 items-center justify-center transition ${skin.iconBtn}`}><RotateCcw size={15} /></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý" className={`flex h-9 w-9 items-center justify-center transition ${skin.iconBtn}`}><X size={18} /></button>
          </header>

          <ul ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
            {messages.map((m) => <Bubble key={m.id} m={m} skin={skin} />)}
            {sending && (
              <li className="flex items-center gap-2.5">
                <BotAvatar size={30} mood="thinking" skin={skin} />
                <span className={`flex items-center gap-1.5 px-4 py-3 ${skin.typing}`}>
                  {[0, 1, 2].map((i) => <span key={i} className={`h-2 w-2 animate-[hd-dot_1.2s_ease-in-out_infinite] ${skin.typingDot}`} style={{ animationDelay: `${i * 0.15}s` }} />)}
                </span>
              </li>
            )}
          </ul>

          {messages.length <= 1 && !sending && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className={`shrink-0 px-3 py-1.5 text-xs transition ${skin.chip}`}>{s}</button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className={`flex items-end gap-2 p-3 ${skin.form}`}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              rows={1}
              placeholder="Hỏi về dự án, căn hộ, chính sách..."
              aria-label="Câu hỏi"
              className={`max-h-28 min-h-11 flex-1 resize-none px-4 py-3 text-sm outline-none transition ${skin.input}`}
            />
            <button type="submit" disabled={!text.trim() || sending} aria-label="Gửi" className={`flex h-11 w-11 shrink-0 items-center justify-center transition disabled:opacity-40 ${skin.send}`}>
              <ArrowUp size={18} />
            </button>
          </form>
        </section>
      )}

      {/* Lời chào bật lên */}
      {greet && !open && (
        <div className={`relative mr-2 max-w-[260px] origin-bottom-right animate-[hd-chat-open_0.5s_cubic-bezier(0.2,0.8,0.2,1.2)] px-4 py-3 text-sm ${skin.greet}`}>
          <button type="button" onClick={() => setGreet(false)} aria-label="Ẩn lời chào" className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center ${skin.greetClose}`}><X size={12} /></button>
          <button type="button" onClick={() => setOpen(true)} className="text-left">
            Xin chào 👋 Mình là <b className={skin.accentText}>trợ lý {ASSISTANT}</b>. Bạn cần tìm căn hộ hay hỏi về dự án nào?
          </button>
        </div>
      )}

      {/* Nút mở: quả cầu năng lượng + vòng sóng lan + nhấp nhô */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        aria-expanded={open}
        className="group relative flex h-20 w-20 items-center justify-center transition hover:scale-110"
      >
        {/* Quầng sáng dưới chân robot */}
        <span className="absolute bottom-1 left-1/2 h-6 w-16 -translate-x-1/2 rounded-full bg-[#2fd170]/45 blur-xl transition group-hover:bg-[#86efac]/65" aria-hidden />
        {open ? (
          <span className={`relative flex h-14 w-14 items-center justify-center ${skin.closeOrb}`}><X size={22} /></span>
        ) : (
          <span className="relative drop-shadow-[0_10px_20px_rgba(203,167,101,0.4)]">
            <Mascot size={76} track wave={hover || greet} mood={hover ? "happy" : "idle"} />
          </span>
        )}
        {!open && (
          <span className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 text-xs opacity-0 transition group-hover:opacity-100 ${skin.tooltip}`}>
            Hỏi trợ lý AI
          </span>
        )}
      </button>
    </div>
  );
}
