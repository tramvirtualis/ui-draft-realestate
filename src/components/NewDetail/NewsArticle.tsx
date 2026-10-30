import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Images,
  Tag,
  X,
} from "lucide-react";
import type { News, NewsImage } from "../../types/new/news.types";
import { isHtml, sanitizeHtml } from "../../utils/richText";

interface NewsArticleProps {
  news: News;
  contentRef: RefObject<HTMLDivElement | null>;
  aside: ReactNode;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80";

// Chú thích ảnh chỉ là tên file (vd "BĐS.jpg") thì không hiện
const isFileName = (s: string) =>
  /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(s.trim());

// Kiểu chữ đọc báo cho nội dung bài (HTML admin soạn bằng TipTap): đoạn mở đầu nổi bật, tiêu đề mục có vạch tím
// (h2/h3 hoặc đoạn chỉ có chữ đậm, được useArticleToc gắn data-toc-heading), gạch đầu dòng chấm tím, link gạch chân mảnh
const PROSE = [
  "text-base leading-[1.85] text-heading [overflow-wrap:anywhere] sm:text-[17px]",
  "[&>*+*]:mt-[1.15rem] [&_p:empty]:hidden",
  "[&>p:first-child]:text-[1.08rem] [&>p:first-child]:font-medium [&>p:first-child]:leading-[1.8] sm:[&>p:first-child]:text-[1.2rem]",
  "[&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:border-l-4 [&_h2]:border-primary-500 [&_h2]:pl-4 [&_h2]:text-[1.35rem] [&_h2]:font-bold [&_h2]:leading-snug",
  "[&_h3]:mt-8 [&_h3]:scroll-mt-28 [&_h3]:text-[1.15rem] [&_h3]:font-bold [&_h3]:leading-snug",
  "[&_[data-toc-heading]]:mt-10 [&_[data-toc-heading]]:scroll-mt-28 [&_[data-toc-heading]]:border-l-4 [&_[data-toc-heading]]:border-primary-500 [&_[data-toc-heading]]:pl-4 [&_[data-toc-heading]]:text-[1.35rem] [&_[data-toc-heading]]:leading-snug",
  "[&_strong]:font-bold [&_strong]:text-heading",
  "[&_ul]:list-none [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li+li]:mt-2 [&_li>p]:m-0",
  "[&_ul>li]:relative [&_ul>li]:before:absolute [&_ul>li]:before:-left-[1.1rem] [&_ul>li]:before:top-[0.75em] [&_ul>li]:before:size-[7px] [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-primary-500 [&_ul>li]:before:ring-[3px] [&_ul>li]:before:ring-primary-100 [&_ul>li]:before:content-['']",
  "[&_ol>li]:marker:font-bold [&_ol>li]:marker:text-primary-600",
  "[&_a]:text-primary-700 [&_a]:underline [&_a]:decoration-primary-200 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary-600",
  "[&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:bg-primary-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:text-body",
  "[&_img]:max-w-full [&_hr]:my-8 [&_hr]:border-line",
].join(" ");

// Tách nội dung thành các đoạn theo dòng trống / xuống dòng
const toParagraphs = (content: string): string[] =>
  content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

// Thân bài: ảnh bìa rộng đè lên hero, rồi 2 cột — nội dung | cột phải.
// Cuối bài: ảnh đính kèm, thẻ chuyên mục, hộp tác giả. Bấm ảnh mở lightbox
export default function NewsArticle({
  news,
  contentRef,
  aside,
}: NewsArticleProps) {
  const [cover, ...gallery] = news.images;
  const html = isHtml(news.content ?? "");
  const paragraphs = html ? [] : toParagraphs(news.content ?? "");
  const [viewing, setViewing] = useState<number | null>(null);
  const caption = cover?.title && !isFileName(cover.title) ? cover.title : null;
  const categories = news.categories?.length
    ? news.categories
    : [news.category].filter(Boolean);

  return (
    <>
      <figure className="group relative">
        <button
          type="button"
          onClick={() => cover && setViewing(0)}
          className="relative block aspect-[16/9] w-full overflow-hidden shadow-2xl shadow-primary-200/70 md:aspect-[21/9]"
          aria-label="Xem ảnh lớn"
        >
          <img
            src={cover?.imageUrl || FALLBACK_IMAGE}
            alt={cover?.title || news.title}
            className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-[1.03]"
          />
          {cover && (
            <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Expand size={13} /> Xem ảnh lớn
            </span>
          )}
        </button>
        {caption && (
          <figcaption className="mt-3 text-center text-xs italic text-body">
            {caption}
          </figcaption>
        )}
      </figure>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <article className="min-w-0 rounded-[28px] border border-line bg-white px-6 py-8 shadow-sm md:px-12 md:py-12">
          {html ? (
            <div
              ref={contentRef}
              className={PROSE}
              // nội dung do admin soạn, vẫn làm sạch trước khi hiển thị
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }}
            />
          ) : (
            <div ref={contentRef} className={PROSE}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {gallery.length > 0 && (
            <section className="mt-12">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-600">
                <Images size={16} /> Hình ảnh ({gallery.length})
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((image, i) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setViewing(i + 1)}
                    className={`group relative overflow-hidden bg-primary-50 ${
                      i === 0 && gallery.length >= 3
                        ? "col-span-2 row-span-2"
                        : ""
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      loading="lazy"
                      className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {image.title && (
                      <span className="absolute inset-x-0 bottom-0 line-clamp-1 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                        {image.title}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-6">
              <Tag size={15} className="text-primary-500" />
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to="/news"
                  className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
                >
                  #{c.name}
                </Link>
              ))}
            </div>
          )}
        </article>

        {aside}
      </div>

      {viewing !== null && (
        <Lightbox
          images={news.images}
          index={viewing}
          onChange={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

interface LightboxProps {
  images: NewsImage[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}

function Lightbox({ images, index, onChange, onClose }: LightboxProps) {
  const count = images.length;
  const image = images[index];
  const go = (step: number) => onChange((index + step + count) % count);

  // Esc đóng, ← → chuyển ảnh, khoá cuộn trang khi đang mở
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((index - 1 + count) % count);
      if (e.key === "ArrowRight") onChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, count, onChange, onClose]);

  const navBtn =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25"
      >
        <X size={20} />
      </button>

      <figure onClick={(e) => e.stopPropagation()} className="max-w-5xl">
        <img
          src={image.imageUrl}
          alt={image.title}
          className="max-h-[80vh] w-auto object-contain"
        />
        <figcaption className="mt-3 text-center text-sm text-white/80">
          {image.title}{" "}
          <span className="text-white/50">
            · {index + 1}/{count}
          </span>
        </figcaption>
      </figure>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Ảnh trước"
            className={`${navBtn} left-4`}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Ảnh tiếp"
            className={`${navBtn} right-4`}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  );
}
