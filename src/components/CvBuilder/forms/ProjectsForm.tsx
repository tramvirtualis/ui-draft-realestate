import ListForm from "./ListForm";
import { PeriodFields, RhfField } from "./fields";
import { projectsSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import { uid, type ProjectItem } from "../../../types/job/cv.types";

export default function ProjectsForm({ onNext }: { onNext: () => void }) {
  const items = useCvBuilder((s) => s.data.projects);
  const setSection = useCvBuilder((s) => s.setSection);

  return (
    <ListForm<ProjectItem>
      schema={projectsSchema}
      items={items}
      onChange={(v) => setSection("projects", v)}
      createItem={() => ({
        id: uid(),
        name: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      })}
      addLabel="Thêm dự án"
      emptyText="Chưa có dự án nào. Hãy gọi tên các dự án bạn từng phân phối."
      itemTitle={(item, i) => item.name || `Dự án ${i + 1}`}
      renderFields={({ prefix, form }) => (
        <>
          <RhfField
            form={form}
            name={`${prefix}.name`}
            label="Tên dự án"
            required
            placeholder="The Global City"
          />
          <RhfField
            form={form}
            name={`${prefix}.role`}
            label="Vai trò"
            placeholder="Chuyên viên tư vấn"
          />
          <PeriodFields form={form} prefix={prefix} />
          <RhfField
            form={form}
            name={`${prefix}.description`}
            label="Mô tả"
            textarea
            rows={3}
            placeholder="Chốt 24 căn hộ trong 6 tháng, doanh số 18 tỷ"
          />
        </>
      )}
      onNext={onNext}
    />
  );
}
