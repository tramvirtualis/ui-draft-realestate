import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow: string;
  title: string;
  desc?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  as?: "h2" | "h3";
};

// Tiêu đề section (cùng kiểu trang chủ): nhãn nhỏ chữ hoa có vạch, tiêu đề grotesk đậm viết hoa
export default function LuxuryHeading({ id, eyebrow, title, desc, action, tone = "light", as: Tag = "h2" }: Props) {
  const dark = tone === "dark";
  return (
    <div id={id} className="mb-10 flex scroll-mt-36 flex-wrap items-end justify-between gap-5 md:mb-12">
      <div className="max-w-3xl">
        <p
          className={`flex items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.16em] ${
            dark ? "text-primary-300" : "text-primary-600"
          }`}
        >
          <span className={`h-px w-10 ${dark ? "bg-primary-300/60" : "bg-primary-400/70"}`} aria-hidden />
          {eyebrow}
        </p>
        <Tag className={`heading-display mt-4 text-3xl md:text-5xl ${dark ? "text-white" : "text-heading"}`}>{title}</Tag>
        {desc && <p className={`mt-4 max-w-2xl text-base leading-7 ${dark ? "text-white/70" : "text-body"}`}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}
