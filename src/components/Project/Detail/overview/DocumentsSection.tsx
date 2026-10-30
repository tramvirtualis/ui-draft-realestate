import { Download } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import { outlineBtn } from "../styles";
import type { DocumentItem } from "../../../../data/project/detail/overview";

type Props = { documents: DocumentItem[] };

export default function DocumentsSection({ documents }: Props) {
  return (
    <section className="bg-primary-50/70 py-16">
      <Container>
        <SectionHeading
          id="tai-lieu"
          eyebrow="Tài liệu"
          title="Thông tin đầy đủ để ra quyết định"
          desc="Tải xuống tài liệu chính thức, được cập nhật và kiểm chứng bởi NovaLand Hub."
          action={<button className={outlineBtn}>Tải tất cả <Download size={15} /></button>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map(({ icon: Icon, title, size, note }) => (
            <a key={title} href="#tai-lieu" className="rounded-2xl border border-line bg-white p-5 shadow-sm hover:border-primary-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Icon size={18} />
              </span>
              <p className="mt-6 font-semibold text-heading">{title}</p>
              <p className="mt-2 text-xs text-body">{size}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                {note} <Download size={15} className="text-primary-600" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
