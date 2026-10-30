import ListForm from "./ListForm";
import { RhfField } from "./fields";
import { referencesSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type ReferenceItem } from "../../../types/job/cv.types";

export default function ReferencesForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.references);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<ReferenceItem>
      schema={referencesSchema}
      items={items}
      onChange={(v) => setSection("references", v)}
      createItem={() => ({
        id: uid(),
        name: "",
        position: "",
        company: "",
        phone: "",
        email: "",
      })}
      addLabel="Thêm người tham chiếu"
      emptyText="Chưa có người tham chiếu nào."
      itemTitle={(item, i) => item.name || `Người tham chiếu ${i + 1}`}
      renderFields={({ prefix, form }) => (
        <>
          <RhfField
            form={form}
            name={`${prefix}.name`}
            label="Họ và tên"
            required
            placeholder="Trần Quốc Huy"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <RhfField
              form={form}
              name={`${prefix}.position`}
              label="Chức vụ"
              placeholder="Giám đốc sàn"
            />
            <RhfField
              form={form}
              name={`${prefix}.company`}
              label="Công ty"
              placeholder="Dat Xanh Services"
            />
            <RhfField
              form={form}
              name={`${prefix}.phone`}
              label="Số điện thoại"
              type="tel"
            />
            <RhfField
              form={form}
              name={`${prefix}.email`}
              label="Email"
              type="email"
            />
          </div>
        </>
      )}
      onNext={onNext}
    />
  );
}
