import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useCvBuilder } from "./cvBuilderContext";
import { buildPreExportChecklist } from "./cvCompletion";

export default function CvPreExportChecklist({
  pageCount,
}: {
  pageCount: number;
}) {
  const data = useCvBuilder((s) => s.data);
  const items = buildPreExportChecklist(data, pageCount);

  return (
    <section
      className="rounded-3xl border border-primary-100 bg-primary-50/60 p-5"
      aria-labelledby="cv-check-title"
    >
      <h2 id="cv-check-title" className="text-sm font-semibold text-heading">
        Trước khi tải PDF
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-xs">
            {item.ok ? (
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-success"
                aria-label="Đạt"
              />
            ) : (
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-warning"
                aria-label="Cần xem lại"
              />
            )}
            <span>
              <span className="font-medium text-heading">{item.label}</span>
              <span className="block text-body">{item.hint}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
