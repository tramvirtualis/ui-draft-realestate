import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import SafeImage from "../../../common/SafeImage";
import LuxuryHeading from "./LuxuryHeading";
import RichContent from "./RichContent";
import { imageSrcSet, optimizedImage } from "../../../../utils/imageUrl";
import type { ProjectProfile } from "../../../../types/project/projectOverview.types";

type Props = {
  name: string;
  basePath: string;
  profile: ProjectProfile;
  price: string;
  image: string | null; // ảnh thư viện (khác ảnh hero) đặt dưới phần giới thiệu để cột trái không bị trống
  stats: { label: string; value: number }[];
};

export default function IntroSection({ name, basePath, profile, price, image, stats }: Props) {
  const hasIntro = profile.developmentModel.trim().length > 0;
  const visibleStats = stats.filter((s) => s.value > 0);

  return (
    <section className="py-20 md:py-28" aria-labelledby="gioi-thieu-title">
      <Container>
        {/* Hai cột bắt đầu ngang hàng (trước đây cột phải bị đẩy xuống làm cột trái trống một khoảng lớn) */}
        <div className="grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <article>
            <LuxuryHeading id="gioi-thieu" eyebrow="Giới thiệu dự án" title={`Tổng quan ${name}`} />
            <h2 id="gioi-thieu-title" className="sr-only">Giới thiệu dự án {name}</h2>
            <Reveal variant="up">
              {hasIntro ? (
                // Mô hình phát triển: hiển thị như một mục thông tin bình thường (không làm nổi bật)
                <div>
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Mô hình phát triển</p>
                  <RichContent content={profile.developmentModel} className="mt-2 text-base leading-7 text-body" />
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-primary-200 bg-white/60 px-5 py-8 text-center text-sm text-body">
                  Thông tin giới thiệu dự án đang được cập nhật.
                </p>
              )}
            </Reveal>

            {image && (
              <Reveal variant="up" delay={100}>
                <SafeImage
                  src={optimizedImage(image, 1280)}
                  srcSet={imageSrcSet(image, [640, 1024, 1280])}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  alt={`Không gian dự án ${name}`}
                  decoding="async"
                  className="mt-8 aspect-[16/10] w-full object-cover"
                />
              </Reveal>
            )}
          </article>

          {/* Thẻ giá đứng yên khi cuộn (máy tính) để đi cùng ảnh bên trái, không để lại khoảng trống bên dưới */}
          <aside aria-label="Hồ sơ nhanh dự án" className="lg:sticky lg:top-40">
            <Reveal variant="right">
              {/* Khối tím nhạt có quầng sáng */}
              <div className="relative overflow-hidden rounded-[2rem] border border-primary-200 bg-primary-100 p-7 text-heading md:p-9">
                <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-300/40 blur-3xl" aria-hidden />
                <p className="relative font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600">Giá tham khảo</p>
                <p className="heading-display relative mt-2 text-4xl text-primary-700">{price}</p>

                {profile.types.length > 0 && (
                  <div className="relative mt-6">
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-body">Loại hình sản phẩm</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {profile.types.map((t) => (
                        <li key={t} className="rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-sm text-heading">{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {visibleStats.length > 0 && (
                  <dl className="relative mt-7 grid grid-cols-2 gap-5 border-t border-primary-200 pt-6">
                    {visibleStats.map((s) => (
                      <div key={s.label}>
                        <dd className="heading-display text-4xl tabular-nums text-primary-700">
                          {s.value.toLocaleString("vi-VN")}
                        </dd>
                        <dt className="mt-1 text-xs text-body">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                )}

                <Link
                  to={`${basePath}/inventory`}
                  className="btn-gloss group relative mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 active:scale-95"
                >
                  Xem quỹ căn đang mở bán <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </Container>
    </section>
  );
}
