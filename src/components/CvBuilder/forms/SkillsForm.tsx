import ListForm from "./ListForm";
import { RhfField } from "./fields";
import { skillsSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type SkillItem } from "../../../types/job/cv.types";

export default function SkillsForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.skills);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<SkillItem>
      schema={skillsSchema}
      items={items}
      onChange={(v) => setSection("skills", v)}
      createItem={() => ({ id: uid(), name: "" })}
      addLabel="Thêm kỹ năng"
      emptyText="Chưa có kỹ năng nào. Vd: Tư vấn khách hàng, Đàm phán, Phân tích thị trường."
      itemTitle={(item, i) => item.name || `Kỹ năng ${i + 1}`}
      renderFields={({ prefix, form }) => (
        <RhfField
          form={form}
          name={`${prefix}.name`}
          label="Tên kỹ năng"
          required
          placeholder="Đàm phán chốt giao dịch"
        />
      )}
      onNext={onNext}
    />
  );
}
