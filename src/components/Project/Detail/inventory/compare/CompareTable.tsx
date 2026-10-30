import { forwardRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import CompareUnitHeader from "./CompareUnitHeader";
import { COMPARE_GROUPS, bestValue, isSame } from "./compareRows";
import type { ProjectUnit } from "../../../../../types/project/projectUnits.types";

type Props = {
  units: ProjectUnit[];
  bookingEnabled: boolean;
  diffOnly: boolean; // ẩn tiêu chí mà mọi căn giống nhau
  onRemove: (id: number) => void;
  onOpenPhotos: (unit: ProjectUnit, index: number) => void;
  onOpen: (unit: ProjectUnit) => void;
  onBook: (unit: ProjectUnit) => void;
};

const PENDING = "—";
const LABEL_WIDTH = 180;
const UNIT_WIDTH = 210;

const cell = "h-14 border-b border-l border-line px-3 py-2.5 text-center align-middle";
const labelCell = "sticky left-0 z-10 h-14 border-b border-line bg-white px-5 text-left align-middle text-[13px] font-medium text-body";

/**
 Bảng so sánh: cột tiêu chí dính bên trái (cuộn ngang trên màn nhỏ), các cột căn rộng bằng nhau, hàng cao đều.
 Nhóm tiêu chí thu gọn được; ô tốt nhất tô nền xanh nhạt kèm nhãn, các căn còn lại ghi chênh lệch.
 ref trỏ vào <table> để xuất ảnh đủ mọi cột kể cả phần đang bị cuộn khuất.
 */
const CompareTable = forwardRef<HTMLTableElement, Props>(function CompareTable(
  { units, bookingEnabled, diffOnly, onRemove, onOpenPhotos, onOpen, onBook },
  ref,
) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const groups = COMPARE_GROUPS.map((g) => ({ ...g, rows: diffOnly ? g.rows.filter((r) => !isSame(r, units)) : g.rows })).filter((g) => g.rows.length > 0);

  const toggle = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const groupHeader = (title: string) => {
    const open = !collapsed.has(title);
    return (
      <tr>
        <th colSpan={units.length + 1} className="border-b border-line bg-primary-50/70 p-0 text-left">
          <button
            type="button"
            onClick={() => toggle(title)}
            aria-expanded={open}
            className="sticky left-0 flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm" aria-hidden>
              <ChevronDown size={13} className={`transition ${open ? "" : "-rotate-90"}`} />
            </span>
            {title}
          </button>
        </th>
      </tr>
    );
  };

  return (
    <table
      ref={ref}
      className="w-full table-fixed border-collapse bg-white text-sm"
      style={{ minWidth: LABEL_WIDTH + units.length * UNIT_WIDTH }}
    >
      <colgroup>
        <col style={{ width: LABEL_WIDTH }} />
        {units.map((u) => <col key={u.id} />)}
      </colgroup>

      <thead>
        <tr>
          <th scope="col" className="sticky left-0 z-10 border-b border-line bg-primary-50/70 px-5 text-left align-middle text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
            Tiêu chí
          </th>
          {units.map((u) => (
            <th key={u.id} scope="col" className="border-b border-l border-line p-4 align-top font-normal">
              <CompareUnitHeader
                unit={u}
                bookingEnabled={bookingEnabled}
                onRemove={() => onRemove(u.id)}
                onOpenPhotos={() => onOpenPhotos(u, 0)}
                onOpen={() => onOpen(u)}
                onBook={() => onBook(u)}
              />
            </th>
          ))}
        </tr>
      </thead>

      {groups.map((g) => (
        <tbody key={g.title}>
          {groupHeader(g.title)}
          {!collapsed.has(g.title) &&
            g.rows.map((row) => {
              const best = bestValue(row, units);
              return (
                <tr key={row.label} className="transition hover:bg-primary-50/30">
                  <th scope="row" className={labelCell}>{row.label}</th>
                  {units.map((u) => {
                    const value = row.num?.(u) ?? null;
                    const isBest = best !== null && value === best;
                    const diff = best !== null && value !== null && !isBest && row.delta ? row.delta(Math.abs(value - best)) : null;
                    const text = row.text(u);
                    return (
                      <td key={u.id} className={`${cell} ${isBest ? "bg-primary-50" : ""}`}>
                        {text === null ? (
                          <span className="text-muted">{PENDING}</span>
                        ) : (
                          // Chữ dài (tiêu chuẩn bàn giao, ngân hàng...) tối đa 2 dòng, rê chuột xem đủ
                          <span title={text} className={`line-clamp-2 wrap-break-word text-[13px] leading-5 tabular-nums ${isBest ? "font-bold text-primary-700" : "text-heading"}`}>
                            {text}
                          </span>
                        )}
                        {isBest && <span className="block text-[11px] font-semibold text-primary-600">{row.highlight}</span>}
                        {diff && <span className="block text-[11px] tabular-nums text-muted">{diff}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      ))}
    </table>
  );
});

export default CompareTable;
