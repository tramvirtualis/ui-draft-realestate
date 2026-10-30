import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { FONT, MONO, P } from "./urbanUi";

/* Chân trang của trang chủ nháp (cùng bố cục chân trang trang chủ chính, đổi sang tông xanh): nền sáng, có vạch cắt thẳng với phần trên, nhiều khoảng trống:
   trên cùng: các cột nhỏ (nhãn mono + vạch kẻ ngang);
   khoảng trống lớn;
   dưới đáy: chữ "HUBTECH." in đậm cỡ lớn (chữ thường, không dùng logo) + khẩu hiệu bên phải,
   nằm trên mảng màu loang (xanh tươi / xanh nhạt / vàng kem) mờ dần lên trên;
   hàng cuối: chữ nhỏ (bản quyền, lên đầu trang). */

const EMAIL = "hello@hubtech.vn";

// Trang thông tin chung chưa có trang riêng nên tạm trỏ về trang gần nhất
const INFO: [string, string][] = [
  ["Giới thiệu", "/"],
  ["Hướng dẫn", "/knowledge"],
  ["Chính sách bảo mật", "/knowledge"],
  ["Điều khoản sử dụng", "/knowledge"],
];

// Mảng màu loang ở nửa dưới footer
const WASH = [
  "radial-gradient(55% 75% at 8% 100%, rgba(34,197,94,0.45), transparent 70%)",
  "radial-gradient(45% 65% at 48% 105%, rgba(203,167,101,0.3), transparent 70%)",
  "radial-gradient(50% 80% at 92% 95%, rgba(10,145,80,0.35), transparent 70%)",
  "radial-gradient(40% 60% at 75% 60%, rgba(220,243,228,0.7), transparent 70%)",
].join(", ");

const isExternal = (to: string) => /^(https?:|mailto:|tel:)/.test(to);
const linkCls = "transition-colors hover:text-[#0a9150]";

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return isExternal(to) ? (
    <a href={to} className={linkCls} target={to.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {children}
    </a>
  ) : (
    <Link to={to} className={linkCls}>
      {children}
    </Link>
  );
}

// Nhãn mono + vạch kẻ kéo dài hết cột
function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: MONO, color: P.muted }}>
          {title}
        </span>
        <span className="h-px flex-1" style={{ background: "rgba(16,16,16,0.25)" }} aria-hidden />
      </div>
      <div className="space-y-2 text-base uppercase tracking-tight md:text-lg">{children}</div>
    </div>
  );
}

export default function SkylineFooter() {
  const wordRef = useRef<HTMLDivElement>(null);
  // Cuộn tới thì chữ trồi lên
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setShown(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      id="lien-he"
      className="relative mt-16 scroll-mt-24 overflow-hidden border-t"
      style={{ color: P.black, borderColor: "rgba(16,16,16,0.15)" }}
    >
      {/* Mảng màu loang, mờ dần lên trên */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: WASH,
          maskImage: "linear-gradient(to top, black 55%, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black 55%, transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-360 px-5 pt-16 md:px-10 md:pt-20">
        {/* Trên cùng: các cột nhỏ */}
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Column title="Thông tin">
              <ul className="space-y-2">
                {INFO.map(([label, to]) => (
                  <li key={label}>
                    <FooterLink to={to}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </Column>
          </div>
          <div className="md:col-span-4">
            <Column title="Liên hệ">
              <p>Hubtech</p>
              <p className="normal-case">
                <FooterLink to={`mailto:${EMAIL}`}>{EMAIL}</FooterLink>
              </p>
            </Column>
          </div>
        </div>

        {/* Dưới đáy: chữ lớn + khẩu hiệu, cách xa phần trên */}
        <div className="mt-40 grid items-start gap-6 md:mt-64 md:grid-cols-12 md:gap-8">
          <div ref={wordRef} className="overflow-hidden md:col-span-9" aria-hidden>
            <div
              className="whitespace-nowrap text-[clamp(4rem,17vw,13rem)] font-bold uppercase leading-[0.8] tracking-[-0.06em] transition-[transform,opacity] duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-[clamp(4rem,12.5vw,13rem)]"
              style={{ fontFamily: FONT, transform: shown ? "translateY(0)" : "translateY(100%)", opacity: shown ? 1 : 0 }}
            >
              Hubtech<span style={{ color: P.green }}>.</span>
            </div>
          </div>
          <p className="text-xl leading-snug md:col-span-3 md:text-2xl">Kiến tạo không gian sống, kết nối cộng đồng.</p>
        </div>

        {/* Hàng cuối: chữ nhỏ */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-8 text-sm md:mt-10">
          <span>© 2026 Hubtech. Bảo lưu mọi quyền.</span>
          <span>Nền tảng bất động sản Hubtech</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex cursor-pointer items-center gap-2 transition-colors hover:text-[#0a9150]"
          >
            Lên đầu trang <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
