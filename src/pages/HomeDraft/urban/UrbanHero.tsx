import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Search } from "lucide-react";
import { HERO_IMAGE, HERO_VIDEO } from "../../../components/Home/homeData";
import { FONT } from "./urbanUi";

// Banner mở đầu (dùng chung cho home-draft-3 và home-draft-4): video tràn màn hình, chữ trắng nằm trong video —
// nhãn nhỏ, tiêu đề 2 dòng thẳng lề trái, nút tìm dự án và nút tạm dừng video trên đường kẻ
export default function UrbanHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.current?.pause();
      setPlaying(false);
    }
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section id="trang-chu" className="relative isolate flex min-h-svh flex-col overflow-hidden text-[#f6f1e7]" style={{ fontFamily: FONT }}>
      <video
        ref={video}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster={HERO_IMAGE}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      {/* Phủ tối: đậm ở trên (menu) và dưới (chữ), giữa nhạt để thấy video */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/55 via-black/15 to-black/70" aria-hidden />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-10 pt-32 md:px-10 md:pb-14">
        {/* Dòng nhãn nhỏ phía trên, tiêu đề 2 dòng thẳng lề trái, giãn dòng đủ cho dấu tiếng Việt */}
        <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-[#f6f1e7]/80">
          <span className="h-px w-10 bg-[#f6f1e7]/70" aria-hidden /> Tầm nhìn 2026
        </p>
        <h1 className="max-w-[16ch] text-[11vw] font-medium uppercase leading-[1.08] tracking-[-0.03em] drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)] lg:text-[5.6vw]">
          Bất động sản
          <br />
          <span className="font-light">tầm nhìn số</span>
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#f6f1e7]/30 pt-6">
          <Link
            to="/projects"
            className="flex items-center gap-2 rounded-full bg-[#f6f1e7] px-6 py-3.5 text-xs font-medium uppercase tracking-wide text-[#101010] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)] transition hover:bg-[#d6f7e1]"
          >
            <Search size={14} /> Tìm dự án
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Tạm dừng video" : "Phát video"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f6f1e7]/60 bg-[#f6f1e7]/10 backdrop-blur transition hover:bg-[#f6f1e7]/25"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
}
