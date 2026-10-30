import EditText, { useCvEdit } from "../EditText";
import type { CvData } from "../../../../types/job/cv.types";

export default function CustomBlock({
  data,
  id,
}: {
  data: CvData;
  id: string;
}) {
  const section = data.customSections.find((s) => s.id === id);
  const edit = useCvEdit();
  return (
    <EditText
      as="p"
      multiline
      className="block whitespace-pre-line text-[0.92em] text-gray-700"
      value={section?.content ?? ""}
      onCommit={edit?.custom(id)}
    />
  );
}
