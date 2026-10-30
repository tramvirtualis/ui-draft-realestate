import type { ReactNode } from "react";
import { ArrowUpRight, Banknote, Compass, FileText, Gift, Home, KeyRound, LayoutTemplate, Ruler, Square, Tag } from "lucide-react";
import { PENDING, area, billion, dateVi, million } from "./unitDetailFormat";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

// ---------- Khối dùng chung ----------

function Card({ title, icon, actions, children }: { title: string; icon: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_1px_2px_rgba(19,41,75,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-200/50 text-gold-500" aria-hidden>{icon}</span>
          {title}
        </h3>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value, strong = false }: { label: string; value: ReactNode | null; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-body">{label}</dt>
      <dd className={`mt-1 break-words ${value == null ? "text-sm italic text-muted" : strong ? "text-base font-semibold text-navy" : "text-sm font-medium text-heading"}`}>
        {value ?? PENDING}
      </dd>
    </div>
  );
}

// Nút mở tài liệu (phiếu tính giá, layout, chính sách): cùng một kiểu; chưa có thì mờ kèm tooltip
export function DocAction({ href, label, icon }: { href: string | null; label: string; icon: ReactNode }) {
  const base = "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition";
  if (!href) {
    return (
      <span title={`${label}: ${PENDING.toLowerCase()}`} aria-disabled="true" className={`${base} cursor-not-allowed border-line bg-primary-50/40 text-muted`}>
        {icon} {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Mở ${label.toLowerCase()} trong tab mới`}
      className={`${base} border-navy/15 bg-white text-navy hover:border-gold-400 hover:bg-gold-200/30 focus-visible:outline-2 focus-visible:outline-gold-400`}
    >
      {icon} {label} <ArrowUpRight size={13} aria-hidden />
    </a>
  );
}

// ---------- Thông tin nhanh ----------

export function QuickSpecs({ unit }: { unit: ProjectUnit }) {
  const items = [
    { icon: <Home size={16} />, label: "Loại hình", value: unit.type && unit.type !== "—" ? unit.type : null },
    { icon: <Compass size={16} />, label: "Hướng", value: unit.direction || null },
    { icon: <Square size={16} />, label: "DT đất", value: area(unit.area) },
    { icon: <Ruler size={16} />, label: "DT xây dựng", value: area(unit.constructionArea) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-navy/10 bg-primary-50/30 px-3.5 py-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-body">
            <span className="text-gold-500" aria-hidden>{it.icon}</span>
            {it.label}
          </dt>
          <dd className={`mt-1.5 truncate ${it.value ? "text-sm font-semibold text-navy" : "text-sm italic text-muted"}`} title={it.value ?? undefined}>
            {it.value ?? PENDING}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Tài chính ----------

export function FinanceCard({ unit }: { unit: ProjectUnit }) {
  const listed = billion(unit.priceBillion);
  const prepay = billion(unit.prepaymentPriceBillion);
  return (
    <Card title="Giá & tài chính" icon={<Banknote size={15} />} actions={<DocAction href={unit.pricingSheet} label="Phiếu tính giá" icon={<FileText size={13} aria-hidden />} />}>
      <div className="rounded-xl bg-primary-600 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.14em] text-gold-300">Giá niêm yết</p>
        <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{listed ?? "Liên hệ"}</p>
        {million(unit.unitPriceMillion) && <p className="mt-1 text-xs text-white/70">≈ {million(unit.unitPriceMillion)}</p>}
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Giá thanh toán sớm (TTS)" strong value={prepay ? <>{prepay}{unit.prepaymentDiscountRate ? <span className="ml-2 rounded-full bg-pop-50 px-2 py-0.5 text-[11px] font-semibold text-pop-600">−{unit.prepaymentDiscountRate}%</span> : null}</> : null} />
        <Field label="Giá vay" strong value={billion(unit.loanPriceBillion)} />
        <Field label="Đơn giá" value={million(unit.unitPriceMillion)} />
        <Field
          label="Ngân hàng hỗ trợ"
          value={
            unit.banks.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {unit.banks.map((b) => (
                  <span key={b} className="rounded-md border border-navy/10 bg-primary-50/50 px-2 py-0.5 text-xs font-semibold text-navy">{b}</span>
                ))}
              </span>
            ) : null
          }
        />
      </dl>
    </Card>
  );
}

// ---------- Chính sách & quà tặng ----------

export function PolicyCard({ unit }: { unit: ProjectUnit }) {
  return (
    <Card
      title="Chính sách & quà tặng"
      icon={<Tag size={15} />}
      actions={
        <>
          <DocAction href={unit.salesPolicySummaryUrl} label="Tóm tắt" icon={<FileText size={13} aria-hidden />} />
          <DocAction href={unit.salesPolicyDetailUrl} label="Chi tiết" icon={<FileText size={13} aria-hidden />} />
        </>
      }
    >
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Áp dụng từ ngày" value={dateVi(unit.salesPolicyEffectiveDate)} />
        <Field
          label="Quà tặng"
          value={unit.gift ? <span className="inline-flex items-start gap-1.5"><Gift size={14} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />{unit.gift}</span> : null}
        />
      </dl>
    </Card>
  );
}

// ---------- Bàn giao ----------

export function HandoverCard({ unit }: { unit: ProjectUnit }) {
  const inventory = unit.propertyInventoryType;
  return (
    <Card title="Bàn giao" icon={<KeyRound size={15} />} actions={<DocAction href={unit.layoutUrl} label="Layout" icon={<LayoutTemplate size={13} aria-hidden />} />}>
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Tiêu chuẩn bàn giao" value={unit.handoverStandard} />
        <Field
          label="Quỹ căn"
          value={
            inventory ? (
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${inventory.toLowerCase().includes("sơ cấp") ? "bg-primary-600 text-white" : "bg-gold-200/60 text-gold-950"}`}>
                {inventory}
              </span>
            ) : null
          }
        />
        <Field label="Vị trí" value={`Phân khu ${unit.zone}${unit.floor ? ` · Tầng ${unit.floor}` : ""}`} />
      </dl>
    </Card>
  );
}
