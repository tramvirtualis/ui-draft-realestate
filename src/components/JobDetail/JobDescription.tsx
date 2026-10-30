import type { JobDetailSection } from "../../types/job/jobDetail.types";

/** "Chi tiết công việc": các mục mô tả, yêu cầu, quyền lợi dạng gạch đầu dòng tím */
export default function JobDescription({
  sections,
}: {
  sections: JobDetailSection[];
}) {
  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8"
      aria-labelledby="job-detail-title"
    >
      <h2 id="job-detail-title" className="text-xl font-medium text-heading">
        Chi tiết công việc
      </h2>

      <div className="mt-5 space-y-6">
        {sections.map((s) => (
          <div key={s.heading}>
            <h3 className="mb-3 text-base font-semibold text-heading">
              {s.heading}
            </h3>
            <ul className="grid list-disc gap-2 pl-5 text-sm leading-relaxed text-body marker:text-primary-600">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
