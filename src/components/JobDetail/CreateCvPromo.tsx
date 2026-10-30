import { Link } from "react-router-dom";
import { FilePlus2 } from "lucide-react";

export default function CreateCvPromo() {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm" aria-labelledby="cv-promo-title">
      <FilePlus2 size={22} className="text-primary-600" aria-hidden />
      <h2 id="cv-promo-title" className="mt-3 text-lg font-medium text-heading">
        Chưa có CV?
      </h2>
      <p className="mt-2 text-sm text-body">
        Tạo hồ sơ chuyên nghiệp trên NovaLand Hub để sẵn sàng cho cơ hội tiếp theo.
      </p>
      <Link
        to="/jobs/create-cv"
        className="mt-5 flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-primary-600 transition hover:bg-primary-50"
      >
        <FilePlus2 size={15} aria-hidden /> Tạo CV ngay
      </Link>
    </section>
  );
}
