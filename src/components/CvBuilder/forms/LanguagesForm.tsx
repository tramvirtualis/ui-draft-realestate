import ListForm from "./ListForm";
import { RhfField } from "./fields";
import { languagesSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type LanguageItem } from "../../../types/job/cv.types";

export default function LanguagesForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.languages);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<LanguageItem>
      schema={languagesSchema}
      items={items}
      onChange={(v) => setSection("languages", v)}
      createItem={() => ({ id: uid(), name: "", level: "" })}
      addLabel="Thêm ngôn ngữ"
      emptyText="Chưa có ngôn ngữ nào."
      itemTitle={(item, i) => item.name || `Ngôn ngữ ${i + 1}`}
      renderFields={({ prefix, form }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <RhfField
            form={form}
            name={`${prefix}.name`}
            label="Ngôn ngữ"
            required
            placeholder="Tiếng Anh"
          />
          <RhfField
            form={form}
            name={`${prefix}.level`}
            label="Trình độ"
            required
            placeholder="IELTS 7.0 / Giao tiếp tốt"
          />
        </div>
      )}
      onNext={onNext}
    />
  );
}
