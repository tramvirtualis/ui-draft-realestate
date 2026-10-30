import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

export default function ObjectiveBlock({ data }: { data: CvData }) {
  const edit = useCvEdit();
  return (
    <EditText
      as="p"
      multiline
      className="block whitespace-pre-line text-[0.92em] leading-relaxed text-gray-700"
      value={data.objective}
      onCommit={edit?.objective()}
      placeholder="Mục tiêu nghề nghiệp"
    />
  );
}
