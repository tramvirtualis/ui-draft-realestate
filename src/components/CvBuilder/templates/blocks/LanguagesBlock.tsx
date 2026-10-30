import { AVOID_BREAK, blockTone } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

export default function LanguagesBlock({
  data,
  dark = false,
}: {
  data: CvData;
  dark?: boolean;
}) {
  const t = blockTone(dark);
  const edit = useCvEdit();
  return (
    <ul className="space-y-1">
      {data.languages.map((l) => (
        <li
          key={l.id}
          className={`${AVOID_BREAK} flex justify-between gap-2 text-[0.92em] ${t.text}`}
        >
          <EditText
            className="font-medium"
            value={l.name}
            onCommit={edit?.item("languages", l.id, "name")}
            placeholder="Ngôn ngữ"
          />
          <EditText
            className={`text-[0.85em] ${t.muted}`}
            value={l.level}
            onCommit={edit?.item("languages", l.id, "level")}
            placeholder="Trình độ"
          />
        </li>
      ))}
    </ul>
  );
}
