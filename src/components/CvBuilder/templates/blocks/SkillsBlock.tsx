import { AVOID_BREAK, blockTone } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

/** Danh sách kỹ năng dạng gạch đầu dòng */
export default function SkillsBlock({
  data,
  dark = false,
}: {
  data: CvData;
  dark?: boolean;
}) {
  const t = blockTone(dark);
  const edit = useCvEdit();
  return (
    <ul className={`list-disc space-y-1 pl-4 text-[0.92em] ${t.text}`}>
      {data.skills.map((s) => (
        <li key={s.id} className={AVOID_BREAK}>
          <EditText
            value={s.name}
            onCommit={edit?.item("skills", s.id, "name")}
            placeholder="Tên kỹ năng"
          />
        </li>
      ))}
    </ul>
  );
}
