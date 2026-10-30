import { AVOID_BREAK, blockTone } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import { formatPeriod } from "../../cvHelpers";
import type { CvData } from "../../../../types/job/cv.types";

export default function EducationBlock({
  data,
  dark = false,
}: {
  data: CvData;
  dark?: boolean;
}) {
  const t = blockTone(dark);
  const edit = useCvEdit();
  return (
    <div className="space-y-2">
      {data.education.map((e) => (
        <div key={e.id} className={AVOID_BREAK}>
          <EditText
            as="p"
            className={`font-semibold ${t.strong}`}
            value={e.school}
            onCommit={edit?.item("education", e.id, "school")}
            placeholder="Tên trường"
          />
          <EditText
            as="p"
            className={`text-[0.92em] ${t.body}`}
            value={e.major}
            onCommit={edit?.item("education", e.id, "major")}
            placeholder="Chuyên ngành"
          />
          <p className={`text-[0.85em] ${t.muted}`}>{formatPeriod(e)}</p>
        </div>
      ))}
    </div>
  );
}
