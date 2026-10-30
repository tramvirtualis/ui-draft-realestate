import { useState } from "react";
import { ExternalLink, Play, Video as VideoIcon } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../luxury/LuxuryHeading";
import Reveal from "../../../common/Reveal";
import { formatDate } from "../../../../utils/formatDate";
import { parseVideoSource } from "../../../../utils/videoSource";
import type { VideoItem } from "../../../../types/project/projectOverview.types";

type Props = { videos: VideoItem[] };

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80";

// Màn hình phát: hiện ảnh bìa + nút phát, bấm mới tải trình phát để trang nhẹ và mượt
function VideoStage({ video, poster }: { video: VideoItem; poster: string }) {
  const [playing, setPlaying] = useState(false);
  const source = parseVideoSource(video.url);
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
    return <video src={source.src} controls autoPlay className="absolute inset-0 h-full w-full bg-black object-contain" />;
  }

  const open = () => {
    if (source.kind === "link") window.open(source.src, "_blank", "noopener,noreferrer");
    else setPlaying(true);
  };

  return (
    <button type="button" onClick={open} aria-label={`Phát video ${video.name}`} className="group absolute inset-0 block h-full w-full">
      <img src={cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-primary-900/75 via-primary-900/15 to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary-300/40" />
        <span className="btn-gloss relative flex h-20 w-20 items-center justify-center rounded-full text-white transition duration-300 group-hover:scale-110">
          {source.kind === "link" ? <ExternalLink size={26} /> : <Play size={30} className="ml-1 fill-white" />}
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 p-5 text-left text-white md:p-7">
        <span className="block font-heading text-xl font-extrabold uppercase leading-[1.2] tracking-tight md:text-3xl">{video.name}</span>
        {video.description && <span className="mt-2 line-clamp-2 block max-w-2xl text-sm text-white/80">{video.description}</span>}
      </span>
    </button>
  );
}

export default function VideosSection({ videos }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  return (
    // Dải tím nhạt cho phần video
    <section className="bg-primary-100/70 py-20 md:py-24">
      <Container>
        <SectionHeading
          id="video"
          eyebrow="Video"
          title="Khám phá dự án qua video"
          desc="Phim giới thiệu, góc quay thực tế và hành trình trải nghiệm tại dự án."
          action={
            videos.length > 0 ? (
              <span className="flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700">
                <VideoIcon size={14} /> {videos.length} video
              </span>
            ) : undefined
          }
        />

        {!active ? (
          <p className="rounded-2xl border border-dashed border-primary-200 bg-white/60 px-4 py-10 text-center text-sm text-body">
            Dự án chưa có video.
          </p>
        ) : (
          <div className={`mx-auto grid gap-5 ${videos.length > 1 ? "max-w-6xl lg:grid-cols-[1fr_300px]" : "max-w-4xl"}`}>
            <Reveal variant="zoom">
              <div className="overflow-hidden bg-ink-950 shadow-[0_30px_60px_-30px_rgba(201,153,31,0.5)]">
                <div className="relative aspect-video w-full">
                  {/* key theo video để chuyển video thì trình phát được dựng lại */}
                  <VideoStage key={active.id} video={active} poster={FALLBACK_POSTER} />
                </div>
              </div>
            </Reveal>

            {videos.length > 1 && (
              <Reveal variant="right" delay={120}>
                <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
                  {videos.map((v, i) => {
                    const src = parseVideoSource(v.url);
                    const selected = v.id === active.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveId(v.id)}
                        aria-pressed={selected}
                        className={`group flex items-center gap-3 rounded-2xl border p-2.5 text-left transition duration-300 ${
                          selected
                            ? "border-primary-400 bg-primary-50"
                            : "border-white bg-white hover:-translate-y-0.5 hover:border-primary-200"
                        }`}
                        style={{ transitionDelay: `${i * 20}ms` }}
                      >
                        <span className="relative h-16 w-28 shrink-0 overflow-hidden bg-primary-100">
                          {src.poster ? (
                            <img src={src.poster} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-200 to-primary-100 text-primary-600">
                              <VideoIcon size={22} />
                            </span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-primary-900/15">
                            <Play size={16} className="fill-white text-white" />
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className={`line-clamp-2 block text-sm font-semibold ${selected ? "text-primary-700" : "text-heading"}`}>{v.name}</span>
                          <span className="mt-1 block text-[11px] text-muted">{formatDate(v.createdAt)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
