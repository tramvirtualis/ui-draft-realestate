import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Breadcrumb from "../common/Breadcrumb";

type Props = {
  breadcrumb: { label: string; to?: string }[];
  eyebrow: string;
  title: string;
  desc?: string;
  icon?: LucideIcon;
  stats?: { value: ReactNode; label: string }[];
};

// Phần đầu các trang con của Thư viện kiến thức (tất cả danh mục, 1 danh mục)
export default function KnowledgeSubHero({ breadcrumb, eyebrow, title, desc, icon: Icon, stats }: Props) {
  return (
    <section className="bg-gradient-to-b from-primary-100 via-primary-50 to-page pb-24 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-3xl items-start gap-4">
            {Icon && (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-200">
                <Icon size={26} />
              </span>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-heading md:text-5xl">{title}</h1>
              {desc && <p className="mt-3 text-[15px] leading-relaxed text-body">{desc}</p>}
            </div>
          </div>

          {stats && (
            <div className="flex gap-8 text-right">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-heading">{s.value}</p>
                  <p className="text-[11px] text-body">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
