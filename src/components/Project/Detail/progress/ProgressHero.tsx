import { Link } from "react-router-dom";
import { ArrowDown, CalendarClock, ChevronRight, FileText, Images, MapPin } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import ProgressVideo from "./ProgressVideo";
import { displayDate, formatFull } from "./progressFormat";
import type { ProjectProgress, ViewImage } from "../../../../types/project/progress.types";

type Props = {
  base: string;
  data: ProjectProgress;
  onOpen: (images: ViewImage[], index: number) => void;
  onJump: () => void;
};

// Phần "Tiến độ hiện tại": tiêu đề trang + bản cập nhật mới nhất trình bày đầy đủ
// (bộ ảnh dạng lưới bên trái, ngày / nội dung / video / số liệu bên phải)
export default function ProgressHero({ base, data, onOpen, onJump }: Props) {
  const { project, items } = data;
  // Bản mới nhất theo ngày hiển thị, không phụ thuộc thứ tự API trả về
  const latest = items.reduce<(typeof items)[number] | undefined>(
    (best, p) => (!best || displayDate(p) > displayDate(best) ? p : best),
    undefined,
  );
  const first = items.reduce<(typeof items)[number] | undefined>(
    (best, p) => (!best || displayDate(p) < displayDate(best) ? p : best),
    undefined,
  );
  const photoCount = items.reduce((n, p) => n + p.images.length, 0);

  const imgs: ViewImage[] = latest
    ? latest.images.map((i) => ({ src: i.imageUrl, title: latest.title, date: displayDate(latest).toISOString() }))
    : [];
  const thumbs = imgs.slice(1, 5);
  const extra = imgs.length - 5;

  const stats = [
    { icon: FileText, label: "Bản cập nhật", value: String(items.length) },
    { icon: Images, label: "Hình ảnh thực tế", value: String(photoCount) },
    { icon: CalendarClock, label: "Bắt đầu theo dõi", value: first ? formatFull(displayDate(first)) : "—" },
  ];

  return (
    <section className="border-b border-line bg-page">
      <div className="container mx-auto px-4 pb-14 pt-8 lg:px-8 lg:pb-20">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="transition hover:text-heading">Trang chủ</Link> <ChevronRight size={12} />
          <Link to={base} className="transition hover:text-heading">{project.name}</Link> <ChevronRight size={12} />
          <span className="font-semibold text-heading">Tiến độ</span>
        </nav>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="animate-rise-in">
            <h1 className="heading-display text-4xl text-heading md:text-5xl">Tiến độ dự án</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
              <span className="font-semibold text-heading">{project.name}</span>
              {project.location && (
                <>
                  <span>·</span>
                  <MapPin size={14} className="text-primary-600" /> {project.location}
                </>
              )}
            </p>
          </div>
          {items.length > 1 && (
            <button
              onClick={onJump}
              className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-primary-700 transition hover:text-primary-800 md:self-auto"
            >
              Xem lịch sử tiến độ <ArrowDown size={15} className="transition group-hover:translate-y-0.5" />
            </button>
          )}
        </div>

        {!latest ? (
          <p className="mt-10 rounded-3xl border border-dashed border-primary-200 bg-[#ffffff] px-6 py-16 text-center text-body">
            Dự án chưa có bản cập nhật tiến độ nào.
          </p>
        ) : (
          <article className="animate-rise-in mt-10 overflow-hidden rounded-3xl border border-line bg-[#ffffff] shadow-[0_30px_60px_-40px_rgba(28,37,65,0.45)] [animation-delay:150ms]">
            <div className="grid lg:grid-cols-[1.25fr_1fr]">
              {/* Bộ ảnh của đợt mới nhất */}
              {imgs.length > 0 ? (
                <div className="grid gap-1.5 p-1.5 sm:grid-cols-4 sm:grid-rows-2">
                  <button
                    type="button"
                    onClick={() => onOpen(imgs, 0)}
                    aria-label={`Xem ảnh: ${latest.title}`}
                    className={`group relative overflow-hidden rounded-2xl ${thumbs.length ? "sm:col-span-3 sm:row-span-2" : "sm:col-span-4 sm:row-span-2"}`}
                  >
                    <SafeImage src={imgs[0].src} alt={latest.title} loading="eager" className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </button>
                  {thumbs.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 sm:col-span-1 sm:row-span-2 sm:grid-cols-1">
                      {thumbs.map((t, i) => (
                        <button
                          key={t.src + i}
                          type="button"
                          onClick={() => onOpen(imgs, i + 1)}
                          aria-label={`Xem ảnh ${i + 2}`}
                          className="group relative overflow-hidden rounded-xl"
                        >
                          <SafeImage src={t.src} alt="" className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-110 sm:aspect-auto" />
                          {i === thumbs.length - 1 && extra > 0 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60 text-base font-semibold text-[#ffffff]">+{extra}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-64 items-center justify-center bg-primary-50 text-sm text-muted">Đợt cập nhật này chưa có hình ảnh</div>
              )}

              {/* Thông tin đợt mới nhất */}
              <div className="flex flex-col p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-pop-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffffff]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#ffffff]" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-[#ffffff]" />
                    </span>
                    Tiến độ hiện tại
                  </span>
                  <span className="text-sm font-semibold text-heading">{formatFull(displayDate(latest))}</span>
                </div>

                <h2 className="heading-display mt-5 text-2xl leading-tight text-heading md:text-3xl">{latest.title}</h2>
                {latest.content && (
                  <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-line pr-1 text-sm leading-relaxed text-body md:text-base">{latest.content}</p>
                )}

                {(imgs.length > 0 || latest.videoUrl) && (
                  <div className="mt-5 flex items-center gap-3">
                    {latest.videoUrl && <ProgressVideo url={latest.videoUrl} title={latest.title} />}
                    {imgs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpen(imgs, 0)}
                        className="inline-flex items-center gap-2 rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-600 hover:text-[#ffffff] active:scale-95"
                      >
                        <Images size={15} /> Xem bộ ảnh ({imgs.length})
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-6" aria-hidden />
                <dl className="grid grid-cols-3 gap-3 border-t border-line pt-5">
                  {stats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted">
                        <Icon size={13} className="shrink-0 text-primary-600" aria-hidden /> <span className="truncate">{label}</span>
                      </dt>
                      <dd className="mt-1 truncate font-heading text-lg font-semibold text-heading">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
