import ListForm from "./ListForm";
import { PeriodFields, RhfField } from "./fields";
import { experienceSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type ExperienceItem } from "../../../types/job/cv.types";

export default function ExperienceForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.experience);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<ExperienceItem>
      schema={experienceSchema}
      items={items}
      onChange={(v) => setSection("experience", v)}
      createItem={() => ({
        id: uid(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: "",
        revenueBillion: 0,
        projectCount: 0,
        closeRate: 0,
      })}
      addLabel="Thêm kinh nghiệm"
      emptyText="Chưa có kinh nghiệm nào. Hãy thêm vị trí gần nhất của bạn."
      itemTitle={(item, i) =>
        item.position || item.company || `Kinh nghiệm ${i + 1}`
      }
      renderFields={({ prefix, form }) => (
        <>
          <RhfField
            form={form}
            name={`${prefix}.position`}
            label="Vị trí"
            required
            placeholder="Chuyên viên kinh doanh dự án"
          />
          <RhfField
            form={form}
            name={`${prefix}.company`}
            label="Công ty"
            required
            placeholder="Masterise Homes"
          />
          <PeriodFields form={form} prefix={prefix} />
          <RhfField
            form={form}
            name={`${prefix}.bullets`}
            label="Thành tích"
            note="Mỗi dòng là một gạch đầu dòng"
            textarea
            rows={4}
            placeholder={
              "Đạt top 3 doanh số sàn trong 4 quý liên tiếp\nXây dựng tệp 300+ khách hàng tiềm năng"
            }
          />
          <div className="grid items-end gap-3 sm:grid-cols-3">
            <RhfField
              form={form}
              name={`${prefix}.revenueBillion`}
              label="Doanh số (tỷ)"
              placeholder="42"
              number
              min={0}
            />
            <RhfField
              form={form}
              name={`${prefix}.projectCount`}
              label="Số dự án"
              number
              min={0}
            />
            <RhfField
              form={form}
              name={`${prefix}.closeRate`}
              label="Tỷ lệ chốt (%)"
              number
              min={0}
              max={100}
            />
          </div>
        </>
      )}
      onNext={onNext}
    />
  );
}
