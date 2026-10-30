import ListForm from "./ListForm";
import { RhfField } from "./fields";
import { certificatesSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type CertificateItem } from "../../../types/job/cv.types";

export default function CertificatesForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.certificates);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<CertificateItem>
      schema={certificatesSchema}
      items={items}
      onChange={(v) => setSection("certificates", v)}
      createItem={() => ({ id: uid(), name: "", issuer: "", year: "" })}
      addLabel="Thêm chứng chỉ"
      emptyText="Chưa có chứng chỉ nào. Vd: Chứng chỉ môi giới BĐS, khóa đào tạo kỹ năng bán hàng."
      itemTitle={(item, i) => item.name || `Chứng chỉ ${i + 1}`}
      renderFields={({ prefix, form }) => (
        <>
          <RhfField
            form={form}
            name={`${prefix}.name`}
            label="Tên chứng chỉ"
            required
            placeholder="Chứng chỉ hành nghề môi giới BĐS"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <RhfField
              form={form}
              name={`${prefix}.issuer`}
              label="Đơn vị cấp"
              placeholder="Bộ Xây dựng"
            />
            <RhfField
              form={form}
              name={`${prefix}.year`}
              label="Năm"
              placeholder="2022"
            />
          </div>
        </>
      )}
      onNext={onNext}
    />
  );
}
