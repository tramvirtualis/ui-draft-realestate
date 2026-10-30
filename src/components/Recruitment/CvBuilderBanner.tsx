import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const CHECKLIST = [
  "Mẫu CV chuẩn ngành bất động sản",
  "Gợi ý nội dung theo từng vị trí",
  "Xuất PDF chỉ với một cú nhấp",
  "Tối ưu để nhà tuyển dụng dễ đọc",
];

const TEMPLATES = ["Tối giản", "Hiện đại", "Chuyên nghiệp"];

/** Mockup CV dựng bằng HTML/CSS, đặt trong khung có sidebar chọn mẫu */
function CvMockup() {
  return (
    <div
      className="flex overflow-hidden rounded-2xl bg-white shadow-xl shadow-primary-200/60 ring-1 ring-line"
      role="img"
      aria-label="Bản xem trước mẫu CV môi giới bất động sản"
    >
      <aside className="hidden w-28 shrink-0 space-y-2 border-r border-line bg-primary-50 p-3 sm:block">
        <p className="text-[10px] font-semibold text-heading">Mẫu CV</p>
        {TEMPLATES.map((t, i) => (
          <div
            key={t}
            className={`rounded-md p-1.5 text-center text-[9px] ${
              i === 1 ? "bg-white text-primary-700 ring-1 ring-primary-500" : "bg-white/60 text-body"
            }`}
          >
            <div className="mb-1 h-10 rounded bg-primary-100" />
            {t}
          </div>
        ))}
      </aside>

      <div className="flex-1 p-4 text-[10px] text-body">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <img src="https://i.pravatar.cc/80?img=45" alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-sm font-bold text-heading">TRẦN THẢO VY</p>
            <p className="text-primary-600">Chuyên viên kinh doanh bất động sản</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-4">
          <div className="space-y-2">
            <p className="font-semibold text-heading">Kinh nghiệm</p>
            <div className="h-2 w-full rounded bg-primary-100" />
            <div className="h-2 w-5/6 rounded bg-primary-100" />
            <div className="h-2 w-4/6 rounded bg-primary-100" />
            <p className="pt-1 font-semibold text-heading">Dự án đã thực hiện</p>
            <div className="h-2 w-full rounded bg-primary-100" />
            <div className="h-2 w-3/4 rounded bg-primary-100" />
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-heading">Kỹ năng</p>
            <div className="h-2 w-full rounded bg-primary-100" />
            <div className="h-2 w-2/3 rounded bg-primary-100" />
            <p className="pt-1 font-semibold text-heading">Liên hệ</p>
            <div className="h-2 w-full rounded bg-primary-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CvBuilderBanner() {
  return (
    <section className="py-16" aria-labelledby="cv-heading">
      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Công cụ hỗ trợ ứng viên
          </p>
          <h2 id="cv-heading" className="mt-3 text-3xl font-bold leading-tight text-heading md:text-4xl">
            CV môi giới chuyên nghiệp, đúng ngôn ngữ ngành
          </h2>
          <p className="mt-4 max-w-lg text-body">
            Tạo CV theo mẫu dành riêng cho ngành bất động sản, làm nổi bật doanh số, dự án và kỹ năng
            tư vấn của bạn chỉ trong vài phút.
          </p>

          <ul className="mt-6 space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-heading">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check size={12} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/jobs/create-cv"
              className="flex h-11 items-center rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95"
            >
              Tạo CV ngay
            </Link>
            <Link
              to="/jobs/create-cv?focus=templates"
              className="flex h-11 items-center rounded-full border border-primary-600 px-6 text-sm font-medium text-primary-600 transition hover:bg-primary-50"
            >
              Xem thư viện mẫu
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 p-5 md:p-8">
          <CvMockup />
        </div>
      </div>
    </section>
  );
}
