import { ACCENT, AVOID_BREAK } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import { formatPeriod } from "../../cvHelpers";
import type { CvData } from "../../../../types/job/cv.types";

export default function ProjectsBlock({ data }: { data: CvData }) {
  const edit = useCvEdit();
  return (
    <div className="space-y-2.5">
      {data.projects.map((p) => (
        <div key={p.id} className={AVOID_BREAK}>
          <div className="flex items-baseline justify-between gap-2">
            <EditText
              as="p"
              className="font-semibold text-gray-900"
              value={p.name}
              onCommit={edit?.item("projects", p.id, "name")}
              placeholder="Tên dự án"
            />
            <p className="shrink-0 text-[0.85em] text-gray-500">
              {formatPeriod(p)}
            </p>
          </div>
          {p.role && (
            <p className="text-[0.92em] font-medium" style={ACCENT}>
              <EditText
                value={p.role}
                onCommit={edit?.item("projects", p.id, "role")}
                placeholder="Vai trò"
              />
            </p>
          )}
          {p.description && (
            <EditText
              as="p"
              multiline
              className="mt-0.5 block whitespace-pre-line text-[0.92em] text-gray-700"
              value={p.description}
              onCommit={edit?.item("projects", p.id, "description")}
            />
          )}
        </div>
      ))}
    </div>
  );
}
