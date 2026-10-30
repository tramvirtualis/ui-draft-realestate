import { ChevronDown, Images, PlayCircle } from "lucide-react";
import Reveal from "../../../common/Reveal";
import SafeImage from "../../../common/SafeImage";
import ProgressVideo from "./ProgressVideo";
import { displayDate, formatFull } from "./progressFormat";
import type { Progress, ViewImage } from "../../../../types/project/progress.types";

type Props = {
  item: Progress;
  index: number;
  current?: boolean; // mốc mới nhất (cuối danh sách cũ → mới)
  open: boolean;
  onToggle: () => void;
  onOpen: (images: ViewImage[], index: number) => void;
};

// Một mốc trong lịch sử tiến độ: thu gọn chỉ còn ngày, tiêu đề, số ảnh / có video;
// bấm vào để mở ra nội dung, nút play video và bộ ảnh
export default function TimelineItem({ item, index, current = false, open, onToggle, onOpen }: Props) {
  const date = displayDate(item);
  const left = index % 2 === 0; // luân phiên trái – phải trên desktop
  const imgs: ViewImage[] = item.images.map((i) => ({ src: i.imageUrl, title: item.title, date: date.toISOString() }));
  const thumbs = imgs.slice(1, 4);
  const extra = imgs.length - 4;
  const bodyId = `progress-item-${item.id}`;

  const card = (
    <Reveal delay={80}>
      <div className={`rounded-2xl border bg-white transition ${open ? "border-primary-200 shadow-[0_20px_40px_-30px_rgba(28,37,65,0.5)]" : "border-line hover:border-primary-200"}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-start gap-4 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 md:p-6"
        >
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
              {formatFull(date)}
              {current && (
                <span className="rounded-full bg-pop-500 px-2.5 py-0.5 text-[10px] tracking-[0.15em] text-white">Hiện tại</span>
              )}
            </p>
            <h3 className="mt-2 text-xl font-bold leading-tight text-heading md:text-2xl">{item.title}</h3>
            {!open && (imgs.length > 0 || item.videoUrl) && (
              <p className="mt-2 flex items-center gap-3 text-xs text-muted">
                {imgs.length > 0 && (
                  <span className="inline-flex items-center gap-1"><Images size={13} /> {imgs.length} ảnh</span>
                )}
                {item.videoUrl && (
                  <span className="inline-flex items-center gap-1"><PlayCircle size={13} /> Video</span>
                )}
              </p>
            )}
          </div>
          <span
            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-180 border-primary-600 bg-primary-600 text-white" : "border-line text-primary-700"}`}
            aria-hidden
          >
            <ChevronDown size={16} />
          </span>
        </button>

        {open && (
          <div id={bodyId} className="animate-rise-in border-t border-line px-5 pb-6 pt-5 md:px-6">
            {item.content && <p className="whitespace-pre-line leading-relaxed text-body">{item.content}</p>}

            {imgs.length > 0 && (
              <div className={item.content ? "mt-5" : ""}>
                <button
                  onClick={() => onOpen(imgs, 0)}
                  aria-label={`Xem ảnh: ${item.title}`}
                  className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <SafeImage src={imgs[0].src} alt={item.title} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
                </button>

                {thumbs.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {thumbs.map((t, i) => (
                      <button
                        key={t.src + i}
                        onClick={() => onOpen(imgs, i + 1)}
                        aria-label={`Xem ảnh ${i + 2}`}
                        className="group relative overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-primary-600"
                      >
                        <SafeImage src={t.src} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-110" />
                        {i === thumbs.length - 1 && extra > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-footer/60 text-lg font-semibold text-white">+{extra}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(imgs.length > 0 || item.videoUrl) && (
              <div className="mt-4 flex items-center gap-3">
                {item.videoUrl && <ProgressVideo url={item.videoUrl} title={item.title} />}
                {imgs.length > 0 && (
                  <button
                    onClick={() => onOpen(imgs, 0)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95"
                  >
                    <Images size={15} /> Xem bộ ảnh ({imgs.length})
                  </button>
                )}
              </div>
            )}

            {!item.content && imgs.length === 0 && !item.videoUrl && (
              <p className="text-sm text-muted">Đợt cập nhật này chưa có nội dung chi tiết.</p>
            )}
          </div>
        )}
      </div>
    </Reveal>
  );

  return (
    <article className="relative grid gap-y-6 pb-10 pl-16 last:pb-0 md:grid-cols-[1fr_88px_1fr] md:pl-0">
      {/* Mốc thời gian */}
      <div className="absolute left-0 top-3 flex flex-col items-center md:static md:col-start-2 md:row-start-1 md:pt-3">
        <Reveal variant="zoom">
          <div className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border-4 border-white text-white shadow-lg md:h-[72px] md:w-[72px] ${current ? "bg-primary-600 shadow-primary-200" : "bg-ink-900 shadow-ink-900/20"}`}>
            <span className="text-lg font-bold leading-none md:text-xl">{String(date.getDate()).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase leading-tight opacity-80">T{date.getMonth() + 1}/{String(date.getFullYear()).slice(2)}</span>
          </div>
        </Reveal>
      </div>

      <div className={`md:row-start-1 ${left ? "md:col-start-1 md:pr-6" : "md:col-start-3 md:pl-6"}`}>{card}</div>
    </article>
  );
}
