import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { ArrowUp, Building2, ChevronRight, FileText, MapPin, RotateCcw, X } from "lucide-react";
import { MAX_QUESTION_LENGTH, useChatbot } from "../../hooks/chat/useChatbot";
import type { ChatMessage, ChatSource } from "../../types/chat.types";
import SafeImage from "../common/SafeImage";
import Mascot from "./Mascot";

// Tên trợ lý AI hiển thị trên khung chat
const brand = { assistant: "Hubtech" };

const SUGGESTIONS = ["Dự án nào đang mở bán?", "Căn 2 phòng ngủ giá bao nhiêu?", "Chính sách hỗ trợ vay thế nào?", "Tiến độ xây dựng hiện tại?"];
const MOBILE = "(max-width: 767px)";

/* Hai kiểu giao diện:
   - default: các trang trong UserLayout (bo tròn, navy + kem)
   - urban: trang chủ Hubtech (phẳng, góc vuông, kem + đen, nhấn vàng đồng, font Inter Tight) */
const SKINS = {
  default: {
    font: '"Space Grotesk", sans-serif',
    panel: "rounded-3xl border border-line bg-[#fbf8f2] text-heading shadow-[0_30px_80px_-25px_rgba(15,22,38,0.5)]",
    header: "border-b border-line bg-[#ffffff]",
    headerLine: true,
    title: "hd-display text-sm font-bold tracking-wider text-heading",
    status: "text-[11px] text-muted",
    dot: "bg-emerald-400",
    iconBtn: "rounded-full text-muted hover:bg-page hover:text-heading",
    avatar: "rounded-full bg-navy",
    user: "rounded-2xl rounded-br-md bg-navy text-[#ffffff] shadow-[0_8px_20px_-10px_rgba(15,22,38,0.6)]",
    bot: "rounded-2xl rounded-tl-md border border-line bg-[#ffffff] text-body shadow-[0_4px_14px_-10px_rgba(15,22,38,0.35)]",
    botErr: "rounded-2xl rounded-tl-md border border-danger/30 bg-danger/5 text-danger",
    accentText: "text-primary-700",
    srcHover: "hover:text-primary-700",
    card: "rounded-xl border border-line bg-[#ffffff] hover:border-primary-300 hover:shadow-[0_8px_20px_-12px_rgba(95,70,34,0.45)]",
    cardImg: "rounded-lg",
    typing: "rounded-2xl rounded-tl-md border border-line bg-[#ffffff]",
    typingDot: "rounded-full bg-primary-400",
    chip: "rounded-full border border-primary-200 bg-[#ffffff] text-heading hover:border-primary-500 hover:text-primary-800",
    form: "border-t border-line bg-[#ffffff]",
    input: "rounded-2xl border border-line bg-[#fbf8f2] text-heading placeholder:text-muted focus:border-primary-400 focus:bg-[#ffffff] focus:ring-2 focus:ring-primary-100",
    send: "rounded-full bg-primary-600 text-[#ffffff] shadow-[0_8px_18px_-8px_rgba(148,113,58,0.9)] hover:scale-105 hover:bg-primary-700 disabled:scale-100 disabled:shadow-none",
    greet: "rounded-2xl rounded-br-md border border-line bg-[#fbf8f2] text-body shadow-[0_20px_50px_-20px_rgba(15,22,38,0.55)]",
    greetClose: "rounded-full border border-line bg-[#ffffff] text-muted shadow-sm hover:text-heading",
    closeOrb: "rounded-full border border-[#f2cd5f]/50 bg-[#0f1626] text-[#ffffff] shadow-[0_0_30px_-6px_rgba(232,185,58,0.7)]",
    tooltip: "rounded-full bg-[#0f1626]/95 text-white shadow-lg",
  },
  urban: {
    font: '"Inter Tight", "Inter", system-ui, sans-serif',
    panel: "border border-[#101010] bg-[#faf5f0] text-[#101010] shadow-[10px_10px_0_-2px_rgba(16,16,16,0.12)]",
    header: "bg-[#101010] text-[#faf5f0]",
    headerLine: false,
    title: "text-sm font-semibold uppercase tracking-[0.12em] text-[#faf5f0]",
    status: "font-mono text-[10px] uppercase tracking-wider text-[#faf5f0]/60",
    dot: "bg-[#f2cd5f]",
    iconBtn: "text-[#faf5f0]/70 hover:bg-[#faf5f0]/10 hover:text-[#faf5f0]",
    avatar: "rounded-full bg-[#101010]",
    user: "bg-[#101010] text-[#faf5f0]",
    bot: "border-l-2 border-[#a67d12] bg-[#f3e9e4] text-[#101010]/85",
    botErr: "border-l-2 border-danger bg-danger/5 text-danger",
    accentText: "text-[#a67d12]",
    srcHover: "hover:text-[#a67d12]",
    card: "border border-[#101010]/15 bg-[#ffffff] hover:border-[#a67d12]",
    cardImg: "",
    typing: "border-l-2 border-[#a67d12] bg-[#f3e9e4]",
    typingDot: "rounded-full bg-[#a67d12]",
    chip: "border border-[#101010] bg-transparent text-[#101010] hover:border-[#a67d12] hover:bg-[#fcf1cc] hover:text-[#a67d12]",
    form: "border-t border-[#101010] bg-[#faf5f0]",
    input: "border-b border-[#101010]/30 bg-transparent text-[#101010] placeholder:text-[#101010]/45 focus:border-[#a67d12]",
    send: "bg-[#101010] text-[#faf5f0] hover:bg-[#a67d12]",
    greet: "border border-[#101010] bg-[#faf5f0] text-[#101010]/80 shadow-[6px_6px_0_-1px_rgba(16,16,16,0.12)]",
    greetClose: "rounded-full bg-[#101010] text-[#faf5f0] hover:bg-[#a67d12]",
    closeOrb: "rounded-full bg-[#101010] text-[#faf5f0] shadow-[0_10px_30px_-10px_rgba(16,16,16,0.6)]",
    tooltip: "bg-[#101010] text-[#faf5f0]",
  },
};
type Skin = (typeof SKINS)["default"];
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
export default function Chatbot({ variant = "default" }: { variant?: keyof typeof SKINS }) {
  const skin: Skin = SKINS[variant];
  const { pathname } = useLocation();
  const projectId = getProjectId(pathname);
  const aboveApplyBar = !!matchPath("/jobs/:id", pathname) && pathname !== "/jobs/create-cv";
  const { messages, sending, ask, reset } = useChatbot(projectId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [hover, setHover] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE).matches);
  // Điện thoại: đang cuộn xuống đọc thì giấu nút ra mép phải, cuộn lên / dừng lại thì hiện lại (để nút không che nội dung)
  const [tucked, setTucked] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobile || open) {
      setTucked(false);
      return;
    }
    let lastY = window.scrollY;
    let idle = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > 120) setTucked(true);
      else if (y < lastY - 6) setTucked(false);
      lastY = y;
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setTucked(false), 900); // dừng cuộn → hiện lại
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [mobile, open]);

  // Điện thoại: khung chat là bảng trượt từ dưới lên → khoá cuộn trang phía sau trong lúc mở
  useEffect(() => {
    if (!open || !mobile) return;
    // Khoá cả html lẫn body (Safari iOS đôi khi bỏ qua khoá chỉ đặt trên html)
    const { documentElement: html, body } = document;
    const prev = [html.style.overflow, body.style.overflow];
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      [html.style.overflow, body.style.overflow] = prev;
    };
  }, [open, mobile]);

  useEffect(() => {
    if (!open) return;
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
      className={`hd-dark-island fixed bottom-3 right-3 z-[60] flex flex-col items-end gap-3 transition-transform duration-500 ease-out md:bottom-7 md:right-7 ${
        tucked ? "translate-x-[calc(100%+0.75rem)]" : ""
      }`}
      style={{ fontFamily: skin.font }}
    >
      {/* Điện thoại: lớp tối phía sau bảng chat, chạm để đóng */}
      {open && mobile && (
        <button type="button" aria-label="Đóng trợ lý" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 bg-ink-950/50 animate-[hd-fade-in_0.25s_ease-out]" />
      )}
      {open && (
        <section
          role="dialog"
          aria-modal={mobile || undefined}
          aria-label={`Trợ lý AI ${brand.assistant}`}
          // Máy tính: khung nổi góc phải, cao tối đa = màn hình trừ menu trên (~5.5rem), nút mở + khoảng cách (~6rem) và lề dưới.
          // Điện thoại: bảng trượt từ dưới lên, tràn ngang, cao 85% màn hình (chừa mép trên để thấy đang ở trang nào).
          // Khung chat nền sáng (kem / trắng) theo màu chung của site; dùng thẳng màu của site vì cụm chatbot nằm trong hd-dark-island
          className={`flex flex-col overflow-hidden ${skin.panel} ${
            mobile
              ? "fixed inset-x-0 bottom-0 h-[85svh] w-full origin-bottom animate-[hd-sheet-up_0.35s_cubic-bezier(0.2,0.8,0.2,1)] rounded-t-2xl! border-x-0! border-b-0! pb-[env(safe-area-inset-bottom)]"
              : "h-[min(620px,calc(100svh-13rem))] w-[min(400px,calc(100vw-2.5rem))] origin-bottom-right animate-[hd-chat-open_0.45s_cubic-bezier(0.2,0.8,0.2,1.2)]"
          }`}
        >
          {/* Thanh kéo nhỏ (điện thoại) cho cảm giác bảng trượt */}
          {mobile && <span className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" aria-hidden />}
          <header className={`relative flex items-center gap-3 px-4 py-3.5 ${skin.header}`}>
            {skin.headerLine && <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary-400 to-transparent" aria-hidden />}
            <BotAvatar size={38} mood={sending ? "thinking" : "happy"} skin={skin} />
            <div className="min-w-0 flex-1">
              <p className={skin.title}>TRỢ LÝ {brand.assistant.toUpperCase()}</p>
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

      {/* Nút mở: robot nhấp nhô (điện thoại nhỏ hơn để đỡ che nội dung; ẩn khi bảng chat đang mở vì bảng đã có nút đóng) */}
      {!(open && mobile) && (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        aria-expanded={open}
        className="group relative flex h-14 w-14 items-center justify-center transition hover:scale-110 md:h-20 md:w-20"
      >
        {/* Quầng sáng dưới chân robot */}
        <span className="absolute bottom-1 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full bg-[#e8b93a]/45 blur-xl transition group-hover:bg-[#f2cd5f]/65 md:h-6 md:w-16" aria-hidden />
        {open ? (
          <span className={`relative flex h-12 w-12 items-center justify-center md:h-14 md:w-14 ${skin.closeOrb}`}><X size={22} /></span>
        ) : (
          <span className="relative drop-shadow-[0_10px_20px_rgba(232,185,58,0.4)]">
            <Mascot size={mobile ? 54 : 76} track wave={hover} mood={hover ? "happy" : "idle"} />
          </span>
        )}
        {!open && (
          <span className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 text-xs opacity-0 transition group-hover:opacity-100 ${skin.tooltip}`}>
            Hỏi trợ lý AI
          </span>
        )}
      </button>
      )}
    </div>
  );
}
