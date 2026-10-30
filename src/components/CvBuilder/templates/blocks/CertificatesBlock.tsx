import { AVOID_BREAK, blockTone } from "./blockStyles";
import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

export default function CertificatesBlock({
  data,
  dark = false,
}: {
  data: CvData;
  dark?: boolean;
}) {
  const t = blockTone(dark);
  const edit = useCvEdit();
  return (
    <ul className="space-y-1.5">
      {data.certificates.map((c) => (
        <li key={c.id} className={`${AVOID_BREAK} text-[0.92em] ${t.text}`}>
          <EditText
            className="font-medium"
            value={c.name}
            onCommit={edit?.item("certificates", c.id, "name")}
            placeholder="Tên chứng chỉ"
          />
          {(["issuer", "year"] as const).map(
            (f) =>
              c[f] && (
                <span key={f} className={`text-[0.85em] ${t.muted}`}>
                  {" · "}
                  <EditText
                    value={c[f]}
                    onCommit={edit?.item("certificates", c.id, f)}
                  />
                </span>
              )
          )}
        </li>
      ))}
    </ul>
  );
}
