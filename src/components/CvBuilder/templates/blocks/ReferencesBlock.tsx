import { Fragment } from "react";
import { AVOID_BREAK } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import type { CvData, ReferenceItem } from "../../../../types/job/cv.types";

type Field = Exclude<keyof ReferenceItem, "id">;

export default function ReferencesBlock({ data }: { data: CvData }) {
  const edit = useCvEdit();
  // các trường trên cùng một dòng, ngăn cách bằng " · "
  const line = (r: ReferenceItem, fields: Field[]) =>
    fields
      .filter((f) => r[f])
      .map((f, i) => (
        <Fragment key={f}>
          {i > 0 && " · "}
          <EditText value={r[f]} onCommit={edit?.item("references", r.id, f)} />
        </Fragment>
      ));

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.references.map((r) => (
        <div key={r.id} className={AVOID_BREAK}>
          <EditText
            as="p"
            className="font-semibold text-gray-900"
            value={r.name}
            onCommit={edit?.item("references", r.id, "name")}
            placeholder="Họ và tên"
          />
          <p className="text-[0.92em] text-gray-700">
            {line(r, ["position", "company"])}
          </p>
          <p className="text-[0.85em] text-gray-500">
            {line(r, ["phone", "email"])}
          </p>
        </div>
      ))}
    </div>
  );
}
