import { ArrowDown, MapPin, Navigation } from "lucide-react";
import RichContent from "../luxury/RichContent";

type Props = {
  title: string;
  content: string; // HTML từ trình soạn thảo
  address: string;
  directionsUrl: string | null;
  hasMap: boolean;
};

// Bài viết phân tích vị trí: cột đọc nằm giữa trang; thẻ thông tin nhanh bám theo khi cuộn ở lề phải
// (màn rất rộng mới đủ chỗ), màn nhỏ hơn thì nằm ngang ngay dưới bài viết
export default function LocationArticle({
  title,
  content,
  address,
  directionsUrl,
  hasMap,
}: Props) {
  const hasAside = Boolean(address || directionsUrl || hasMap);

  return (
    <section
      id="phan-tich"
      aria-labelledby="location-article-title"
      className="scroll-mt-36 bg-primary-50/40 py-16 md:py-24"
    >
      <div className="container mx-auto grid gap-10 px-4 lg:px-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)]">
        <article className="mx-auto w-full min-w-0 max-w-3xl 2xl:col-start-2">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold-500">
            <span className="h-px w-10 bg-gold-500/70" aria-hidden />
            Phân tích vị trí
          </p>
          <h2
            id="location-article-title"
            className="mt-4 text-balance font-heading text-3xl font-medium leading-tight tracking-tight text-heading md:text-5xl"
          >
            {title}
          </h2>
          <RichContent
            content={content}
            className="mt-8 text-base md:text-[17px]"
          />
        </article>

        {hasAside && (
          <aside
            className="mx-auto w-full max-w-3xl 2xl:sticky 2xl:top-40 2xl:col-start-3 2xl:mr-0 2xl:max-w-80 2xl:self-start"
            aria-label="Thông tin vị trí"
          >
            <div className="gap-6 rounded-3xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(19,41,75,0.18)] sm:flex sm:items-center sm:justify-between 2xl:block">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Thông tin vị trí
                </p>
                {address && (
                  <p className="mt-4 flex items-start gap-3 text-sm leading-6 text-heading">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"
                      aria-hidden
                    >
                      <MapPin size={16} />
                    </span>
                    <span className="pt-1.5">{address}</span>
                  </p>
                )}
              </div>
              <div className="mt-6 grid shrink-0 gap-2 sm:mt-0 sm:min-w-52 2xl:mt-6">
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                  >
                    <Navigation size={15} aria-hidden /> Chỉ đường
                  </a>
                )}
                {hasMap && (
                  <a
                    href="#ban-do"
                    className="flex items-center justify-center gap-2 rounded-full border border-navy/15 px-5 py-3 text-sm font-semibold text-navy transition hover:border-navy hover:bg-primary-50/60"
                  >
                    Xem bản đồ <ArrowDown size={15} aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
