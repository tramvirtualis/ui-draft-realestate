import { ACCENT, AVOID_BREAK } from "./blockStyles";
import { computeAchievements } from "../../cvHelpers";
import type { CvData } from "../../../../types/job/cv.types";

/** 3 ô số liệu nổi bật (doanh số, số dự án, tỷ lệ chốt) tổng hợp từ các kinh nghiệm */
export default function AchievementsBlock({ data }: { data: CvData }) {
  const a = computeAchievements(data);
  if (!a) return null;

  const cells = [
    a.revenueBillion
      ? { value: `${a.revenueBillion} tỷ`, label: "Doanh số" }
      : null,
    a.projectCount ? { value: String(a.projectCount), label: "Dự án" } : null,
    a.closeRate ? { value: `${a.closeRate}%`, label: "Tỷ lệ chốt" } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className={`${AVOID_BREAK} rounded-md border border-gray-200 px-2 py-2 text-center`}
        >
          <p className="text-[1.5em] font-bold leading-none" style={ACCENT}>
            {c.value}
          </p>
          <p className="mt-1 text-[0.85em] text-gray-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
