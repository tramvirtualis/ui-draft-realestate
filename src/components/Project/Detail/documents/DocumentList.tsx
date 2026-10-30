import { Download, FileText } from "lucide-react";
import { formatDate } from "../../../../utils/formatDate";
import type { ProjectDocument } from "../../../../services/project/projectExtrasService";

type Props = {
  documents: ProjectDocument[];
};

export default function DocumentList({ documents }: Props) {
  return (
    <section className="bg-primary-50/70 py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-xs font-semibold uppercase text-primary-600">Kho tài liệu dự án</p>
        <h2 className="mt-2 text-4xl font-semibold text-heading">Tài liệu chính thức của dự án</h2>
        {documents.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-primary-200 bg-white px-6 py-12 text-center text-sm text-body">
            Dự án chưa có tài liệu nào.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((d, i) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-100"
                style={{ minHeight: 152 }}
              >
                <span className="absolute right-5 top-3 text-5xl font-bold text-primary-200">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600"><FileText size={17} /></span>
                <h3 className="mt-5 text-base font-semibold text-heading">{d.title}</h3>
                <p className="mt-2 flex items-center justify-between text-xs text-body">
                  <span>Cập nhật {formatDate(d.createdAt)}</span>
                  <Download size={15} className="text-primary-600" />
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
