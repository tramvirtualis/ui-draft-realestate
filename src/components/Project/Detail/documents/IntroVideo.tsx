import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, Film, Play, PlaySquare, Sparkles, Video as VideoIcon } from "lucide-react";
import { videoService } from "../../../../services/project/videoService";
import { parseVideoSource, type VideoSource } from "../../../../utils/videoSource";
import { formatDate } from "../../../../utils/formatDate";
import type { VideoDto } from "../../../../types/project/project.types";

type Props = {
  projectId: number;
  projectName: string;
  poster?: string; // ảnh bìa dự phòng khi video không có ảnh bìa riêng (vd file mp4, Vimeo)
};

const SOURCE_LABEL: Record<VideoSource["kind"], string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  file: "Video tải lên",
  link: "Liên kết ngoài",
};

// Khung phát: ảnh bìa + nút phát, bấm mới tải trình phát để trang nhẹ
function Player({ video, poster }: { video: VideoDto; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const source = parseVideoSource(video.videoUrl);
  const cover = source.poster ?? poster;

  if (playing && (source.kind === "youtube" || source.kind === "vimeo")) {
    return (
      <iframe
        title={video.name}
        src={source.embed}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  if (playing && source.kind === "file") {
    return <video src={source.src} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />;
  }

  const open = () => {
    if (source.kind === "link") window.open(source.src, "_blank", "noopener,noreferrer");
    else setPlaying(true);
  };

  return (
    <button type="button" onClick={open} aria-label={`Phát video ${video.name}`} className="group absolute inset-0 block h-full w-full text-left">
      {cover ? (
        <img src={cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-ink-950 text-white/30">
          <Film size={56} />
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-footer/80 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-semibold uppercase text-primary-700 md:left-5 md:top-5">
        <Sparkles size={12} /> Phim giới thiệu dự án
      </span>
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-600 shadow-xl transition duration-300 group-hover:scale-110">
        {source.kind === "link" ? <ExternalLink size={17} /> : <Play size={18} className="ml-0.5 fill-current" />}
      </span>
      <span className="absolute bottom-5 left-5 right-5 text-white md:left-6 md:right-6">
        <span className="line-clamp-2 block text-lg font-semibold md:text-xl">{video.name}</span>
        <span className="mt-1 block text-[11px] text-white/80">{SOURCE_LABEL[source.kind]}</span>
      </span>
    </button>
  );
}

export default function IntroVideo({ projectId, projectName, poster }: Props) {
  const [videos, setVideos] = useState<VideoDto[] | null>(null);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setVideos(null);
    setError(false);
    videoService
      .list(projectId)
      .then((list) => !cancelled && setVideos(list))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const active = videos?.find((v) => v.id === activeId) ?? videos?.[0];

  return (
    <section className="py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-xs font-semibold uppercase text-primary-600">Trải nghiệm dự án</p>
        <h2 className="mt-2 text-3xl font-semibold text-heading md:text-4xl">Video giới thiệu dự án</h2>
        <p className="mt-2 text-sm text-body">Khám phá kiến trúc, cảnh quan và trải nghiệm sống tại dự án.</p>

        {videos === null && !error ? (
          <div className="mt-8 grid animate-pulse gap-5 lg:grid-cols-[1fr_330px]" aria-busy="true">
            <div className="aspect-video bg-primary-100" />
            <div className="h-64 rounded-3xl bg-primary-50" />
          </div>
        ) : error || !active ? (
          <p className="mt-8 rounded-3xl border border-dashed border-line bg-primary-50/50 px-4 py-12 text-center text-sm text-body">
            {error ? "Không tải được video, vui lòng thử lại sau." : `${projectName} chưa có video giới thiệu.`}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="relative aspect-video overflow-hidden bg-ink-950">
              {/* key theo video để đổi video thì trình phát dựng lại */}
              <Player key={active.id} video={active} poster={poster} />
            </div>

            <aside className="flex flex-col rounded-3xl border border-line bg-primary-50/70 p-6">
              <p className="text-[10px] font-semibold uppercase text-primary-600">Tổng quan video</p>
              <h3 className="mt-3 text-xl font-semibold leading-snug text-heading md:text-2xl">{active.name}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-body">
                {active.description || `Video giới thiệu tổng quan về quy hoạch, tiện ích và trải nghiệm sống tại ${projectName}.`}
              </p>
              <ul className="mt-5 space-y-4 border-t border-line pt-5">
                <li className="flex items-center gap-3">
                  <CalendarDays size={17} className="text-primary-600" />
                  <span>
                    <span className="block text-[10px] text-muted">Ngày đăng</span>
                    <span className="block text-sm font-semibold text-heading">{formatDate(active.createdAt)}</span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <PlaySquare size={17} className="text-primary-600" />
                  <span>
                    <span className="block text-[10px] text-muted">Nguồn</span>
                    <span className="block text-sm font-semibold text-heading">{SOURCE_LABEL[parseVideoSource(active.videoUrl).kind]}</span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <VideoIcon size={17} className="text-primary-600" />
                  <span>
                    <span className="block text-[10px] text-muted">Số video của dự án</span>
                    <span className="block text-sm font-semibold text-heading">{videos!.length} video</span>
                  </span>
                </li>
              </ul>

              {videos!.length > 1 && (
                <div className="mt-5 flex max-h-56 flex-col gap-2 overflow-y-auto border-t border-line pt-4">
                  {videos!.map((v) => {
                    const src = parseVideoSource(v.videoUrl);
                    const selected = v.id === active.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveId(v.id)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-xl border p-2 text-left transition ${
                          selected ? "border-primary-400 bg-white" : "border-transparent hover:bg-white/70"
                        }`}
                      >
                        <span className="relative h-11 w-20 shrink-0 overflow-hidden bg-primary-100">
                          {(src.poster ?? poster) && <img src={src.poster ?? poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                          <span className="absolute inset-0 flex items-center justify-center bg-footer/20">
                            <Play size={13} className="fill-white text-white" />
                          </span>
                        </span>
                        <span className={`line-clamp-2 text-[13px] font-medium ${selected ? "text-primary-700" : "text-heading"}`}>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
