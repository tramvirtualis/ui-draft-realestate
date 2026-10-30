import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import type { News } from "../../types/new/news.types";

interface NewsHeroProps {
  total: number;
  featured: News[];
  // Dùng lại cho trang tin của từng dự án: đổi breadcrumb + dòng giới thiệu
  crumbs?: { label: string; to?: string }[];
  eyebrow?: string;
}

const DEFAULT_CRUMBS = [{ label: "Trang chủ", to: "/" }, { label: "Tin tức" }];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1920&q=80";
const SLIDES = 4;
const AUTOPLAY_MS = 6500;

const cover = (n: News) => n.images[0]?.imageUrl || FALLBACK_IMAGE;
const pad = (n: number) => String(n).padStart(2, "0");

// Hero tin tức kiểu tạp chí phương Tây: bài lớn phủ ảnh toàn khung (tự chuyển, nút 01–04),
// 2 bài kế tiếp dạng thẻ ảnh ở góc trên phải, dải trắng 4 tin nằm đè lên mép dưới hero
export default function NewsHero({ total, featured, crumbs = DEFAULT_CRUMBS, eyebrow = "Tin tức bất động sản" }: NewsHeroProps) {
  const slides = featured.slice(0, SLIDES);
  const strip = featured.slice(SLIDES, SLIDES + 4);
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const index = count ? current % count : 0;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  const active = slides[index];

  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#111111] text-white"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Ảnh nền các slide (mờ dần chuyển qua nhau) */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          {(count ? slides : [null]).map((n, i) => (
            <img
              key={n?.id ?? "fallback"}
              src={n ? cover(n) : FALLBACK_IMAGE}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover grayscale-[85%] contrast-[1.1] brightness-[0.85] transition-[opacity,transform] duration-[1200ms] ${
                i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
          {/* Phủ đen trung tính (kiểu ảnh tạp chí đen trắng), đậm ở mép trái và chân cho chữ dễ đọc */}
          <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/35 to-black/5" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/35" />
        </div>

        <div className={`container mx-auto flex min-h-[78svh] flex-col px-4 pt-8 lg:min-h-[86svh] lg:px-8 ${strip.length ? "pb-28" : "pb-12"}`}>
          <div>
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={c.label + i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} />}
                  {c.to ? (
                    <Link to={c.to} className="hover:text-white">{c.label}</Link>
                  ) : (
                    <span className="font-semibold text-white">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-300">
              {eyebrow} · {total.toLocaleString("vi-VN")} bài viết
            </p>
          </div>

          {/* Bài lớn */}
          <div className="mt-auto pt-16">
            {active ? (
              <div key={active.id} className="animate-rise-in max-w-3xl">
                {active.category && (
                  <span className="inline-block bg-pop-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                    {active.category.name}
                  </span>
                )}
                <Link to={`/news/${active.id}`} className="block">
                  <h1 className="mt-5 line-clamp-3 text-3xl font-bold leading-tight tracking-tight text-white transition hover:text-primary-100 md:text-5xl">
                    {active.title}
                  </h1>
                </Link>
              </div>
            ) : (
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">{eyebrow}</h1>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              {active && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/70">
                  <Link to={`/news/${active.id}`} className="group flex items-center gap-3 font-semibold text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition group-hover:border-primary-300 group-hover:bg-primary-600">
                      <ArrowRight size={15} />
                    </span>
                    Đọc bài viết
                  </Link>
                  <span className="hidden h-5 w-px bg-white/25 sm:block" aria-hidden />
                  <span>{formatDate(active.createdAt)}</span>
                  {active.project && (
                    <>
                      <span className="hidden h-5 w-px bg-white/25 md:block" aria-hidden />
                      <span className="hidden md:inline">{active.project.name}</span>
                    </>
                  )}
                </div>
              )}

              {count > 1 && (
                <div className="flex items-center gap-2.5">
                  {slides.map((n, i) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setCurrent(i)}
                      aria-label={`Bài ${i + 1}`}
                      aria-current={i === index}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition ${
                        i === index ? "bg-black text-white ring-2 ring-pop-500" : "bg-black/60 text-white/50 hover:text-white"
                      }`}
                    >
                      {pad(i + 1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dải tin đè lên mép dưới hero */}
      {strip.length > 0 && (
        <div className="relative z-10 bg-page">
          <div className="container mx-auto px-4 lg:px-8">
            <ul className="-mt-16 grid gap-px bg-line shadow-[0_30px_60px_-30px_rgba(15,22,38,0.45)] sm:grid-cols-2 lg:grid-cols-4">
              {strip.map((n) => (
                <li key={n.id} className="bg-white">
                  <Link to={`/news/${n.id}`} className="group flex gap-4 p-4 md:p-5">
                    <img src={cover(n)} alt="" loading="lazy" className="h-16 w-16 shrink-0 object-cover" />
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-heading transition group-hover:text-primary-700">{n.title}</span>
                      <span className="mt-1.5 block text-[11px] text-muted">
                        {n.category?.name} · {formatDate(n.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
