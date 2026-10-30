import { ACCENT, AVOID_BREAK } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import { formatPeriod, splitLines } from "../../cvHelpers";
import type { CvData } from "../../../../types/job/cv.types";

/** Kinh nghiệm làm việc; `timeline` vẽ đường dọc và chấm tròn như mẫu Modern */
export default function ExperienceBlock({
  data,
  timeline = false,
}: {
  data: CvData;
  timeline?: boolean;
}) {
  const edit = useCvEdit();
  return (
    <div
      className={timeline ? "space-y-3 border-l-2 pl-3" : "space-y-3"}
      style={timeline ? { borderColor: "var(--cv-color)" } : undefined}
    >
      {data.experience.map((e) => {
        const lines = splitLines(e.bullets);
        const setBullets = edit?.item("experience", e.id, "bullets");
        return (
          <div key={e.id} className={AVOID_BREAK}>
            <div className="relative flex items-baseline justify-between gap-2">
              {timeline && (
                <span
                  className="absolute -left-[1.1rem] top-[0.4em] h-2 w-2 rounded-full"
                  style={{ background: "var(--cv-color)" }}
                />
              )}
              <EditText
                as="p"
                className="font-semibold text-gray-900"
                value={e.position}
                onCommit={edit?.item("experience", e.id, "position")}
                placeholder="Vị trí"
              />
              <p className="shrink-0 text-[0.85em] text-gray-500">
                {formatPeriod(e)}
              </p>
            </div>
            <p className="text-[0.92em] font-medium" style={ACCENT}>
              <EditText
                value={e.company}
                onCommit={edit?.item("experience", e.id, "company")}
                placeholder="Công ty"
              />
            </p>
            {lines.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.92em] text-gray-700">
                {lines.map((l, i) => (
                  <li key={i}>
                    {/* mỗi dòng sửa riêng; xuống dòng trong một gạch = tách thành nhiều gạch, xóa trống = bỏ gạch */}
                    <EditText
                      value={l}
                      multiline
                      onCommit={
                        setBullets &&
                        ((v) =>
                          setBullets(
                            lines.map((x, j) => (j === i ? v : x)).join("\n")
                          ))
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
