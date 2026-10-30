import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

/** Giới thiệu bản thân (ô "Giới thiệu bản thân" ở bước Thông tin cá nhân) */
export default function SummaryBlock({ data }: { data: CvData }) {
  const edit = useCvEdit();
  return (
    <EditText
      as="p"
      multiline
      className="block whitespace-pre-line text-[0.92em] leading-relaxed text-gray-700"
      value={data.personal.summary}
      onCommit={edit?.personal("summary")}
      placeholder="Giới thiệu bản thân"
    />
  );
}
