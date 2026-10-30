import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { P } from "../../components/Home/urbanUi";
import { galleryState } from "./galleryState";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

/* Đạo diễn chuyển động cho trang chủ. Mọi hiệu ứng gắn với vị trí cuộn (scrub) nên cuộn ngược là tua ngược.
   gsap.matchMedia chia 3 trường hợp:
     - máy tính (≥1024px): đủ cảnh ghim, đoạn ngang, zoom vào bản vẽ;
     - điện thoại / máy tính bảng: giữ các cảnh ghim gọn trong một màn hình, bỏ đoạn ngang + zoom (xếp dọc);
     - giảm chuyển động: không tạo gì, trang hiện bố cục tĩnh.
   Khi đổi trường hợp (xoay máy, đổi cỡ cửa sổ), matchMedia tự gỡ sạch timeline / ghim / SplitText rồi dựng lại. */

const vi = (n: number) => Math.round(n).toLocaleString("vi-VN");

// Đếm số theo timeline: chữ số chạy từ 0 tới data-value
function addCounter(tl: gsap.core.Timeline, el: HTMLElement, at: number, duration = 0.6) {
  const target = Number(el.dataset.value ?? 0);
  const o = { v: 0 };
  tl.fromTo(o, { v: 0 }, { v: target, duration, ease: "power1.out", onUpdate: () => (el.textContent = vi(o.v)) }, at);
}

export function useCinematic(root: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia(el);

    // Cần đủ cả nhánh "mobile": matchMedia chỉ chạy hàm khi có ít nhất một điều kiện khớp
    mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
      if (reduce) return;
      el.dataset.cine = desktop ? "desktop" : "mobile";
      const q = gsap.utils.selector(el);

      /* ===== Cuộn mượt (Lenis): lăn chuột có quán tính, chạy chung nhịp với GSAP =====
         Lenis cuộn chính cửa sổ nên các khối sticky / ScrollTrigger vẫn đúng; màn cảm ứng giữ kiểu cuộn gốc của máy.
         allowNestedScroll: khung con cuộn được (khung chat, menu) vẫn cuộn bên trong thay vì kéo cả trang. */
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, allowNestedScroll: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0); // không "nhảy" khung khi tab bị chậm → chuyển động khớp với Lenis
      const one = <T extends Element = HTMLElement>(s: string) => q(s)[0] as unknown as T;

      /* ===== Cảnh 1 · Mở đầu (ghim): chữ vỡ bay ra hai phía, video co thành khung, số liệu đếm quanh khung ===== */
      {
        const hero = one('[data-c="hero"]');
        const l1 = new SplitText(one('[data-c="hero-l1"]'), { type: "chars" });
        const l2 = new SplitText(one('[data-c="hero-l2"]'), { type: "chars" });
        const frame = one('[data-c="hero-frame"]');
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: hero, start: "top top", end: "+=170%", pin: true, scrub: 1 },
        });
        tl.to(['[data-c="hero-cta"]', '[data-c="hero-kicker"]'].map((s) => one(s)), { autoAlpha: 0, y: 40, duration: 0.25 }, 0)
          .to([l1.chars, l2.chars], { y: -50, autoAlpha: 0, duration: 0.4, ease: "power2.in", stagger: 0.015 }, 0)
          .fromTo(
            frame,
            { clipPath: "inset(0% 0% 0% 0% round 0px)" },
            { clipPath: desktop ? "inset(16% 30% 22% 30% round 28px)" : "inset(24% 6% 38% 6% round 20px)", duration: 1, ease: "power2.inOut" },
            0.15,
          )
          .to(one('[data-c="hero-shade"]'), { opacity: 0.15, duration: 0.8 }, 0.2)
          .from(q('[data-c="hero-stat"]'), { autoAlpha: 0, y: 30, duration: 0.4, stagger: 0.08, ease: "power2.out" }, 0.6)
          .fromTo(one('[data-c="hero-outro"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.95);
        q('[data-c="hero-count"]').forEach((c, i) => addCounter(tl, c as HTMLElement, 0.62 + i * 0.08));
        // Giữ nguyên khung, chỉ cho số liệu mờ đi trước khi nhường chỗ cảnh sau
        tl.to([q('[data-c="hero-stat"]'), one('[data-c="hero-outro"]')], { autoAlpha: 0, duration: 0.3 }, 1.4);
      }

      /* ===== Cảnh 2 · Bốn điều cốt lõi (ghim 4 nhịp): chữ khổng lồ thay nhau, ảnh mở bằng mặt nạ tròn ===== */
      {
        const adv = one('[data-c="adv"]');
        const items = q('[data-c="adv-item"]') as HTMLElement[];
        const part = (it: HTMLElement, c: string) => it.querySelector<HTMLElement>(`[data-c="${c}"]`)!;
        const words = items.map((it) => new SplitText(part(it, "adv-word"), { type: "chars" }));
        const meta = (it: HTMLElement) => [part(it, "adv-desc"), it.querySelector(".cine-adv-no")!];

        items.forEach((it, i) => {
          if (!i) return;
          gsap.set(words[i].chars, { yPercent: 110, autoAlpha: 0 });
          gsap.set(part(it, "adv-img"), { clipPath: "circle(0% at 50% 50%)" });
          gsap.set(meta(it), { autoAlpha: 0, y: 30 });
        });
        // Nhịp đầu trồi lên trong lúc cảnh còn đang cuộn vào
        gsap
          .timeline({ scrollTrigger: { trigger: adv, start: "top 75%", end: "top top", scrub: 1 } })
          .from(words[0].chars, { yPercent: 110, autoAlpha: 0, stagger: 0.04, duration: 0.6, ease: "power3.out" }, 0)
          .fromTo(part(items[0], "adv-img"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 1, ease: "power2.inOut" }, 0)
          .from(meta(items[0]), { autoAlpha: 0, y: 30, duration: 0.4 }, 0.5);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: adv, start: "top top", end: `+=${items.length * 75}%`, pin: true, scrub: 1 },
        });
        for (let i = 1; i < items.length; i++) {
          const at = (i - 1) * 1.1 + 0.2;
          const prev = items[i - 1];
          const cur = items[i];
          tl.to(words[i - 1].chars, { yPercent: -110, autoAlpha: 0, stagger: 0.03, duration: 0.5, ease: "power2.in" }, at)
            .to(meta(prev), { autoAlpha: 0, y: -30, duration: 0.3 }, at)
            .fromTo(part(cur, "adv-img"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.9, ease: "power2.inOut" }, at + 0.1)
            .to(words[i].chars, { yPercent: 0, autoAlpha: 1, stagger: 0.03, duration: 0.5, ease: "power3.out" }, at + 0.35)
            .to(meta(cur), { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.55);
        }
        tl.to({}, { duration: 0.3 });
      }

      /* ===== Cảnh 3 · Tuyên ngôn: ánh sáng kem → đen, ngoặc kép bay vào, chữ sáng dần, các lớp trôi ngược chiều ===== */
      {
        const mani = one('[data-c="mani"]');
        gsap.fromTo(mani, { backgroundColor: P.bg, color: P.black }, { backgroundColor: P.black, color: P.bg, ease: "none", scrollTrigger: { trigger: mani, start: "top 85%", end: "top 25%", scrub: true } });
        gsap.from(one('[data-c="mani-q1"]'), { y: 30, autoAlpha: 0, ease: "power2.out", scrollTrigger: { trigger: mani, start: "top 70%", end: "top 30%", scrub: 1 } });
        gsap.from(one('[data-c="mani-q2"]'), { y: 30, autoAlpha: 0, ease: "power2.out", scrollTrigger: { trigger: mani, start: "top 30%", end: "center 50%", scrub: 1 } });
        gsap.fromTo(q('[data-c="mani-w"]'), { opacity: 0.1 }, { opacity: 1, stagger: 0.06, ease: "none", scrollTrigger: { trigger: mani, start: "top 50%", end: "bottom 80%", scrub: 1 } });
        gsap.fromTo(one('[data-c="mani-imgwrap"]'), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", scrollTrigger: { trigger: mani, start: "top 65%", end: "top 15%", scrub: 1 } });
        const pass = { trigger: mani, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(one('[data-c="mani-img"]'), { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: pass });
        // Màn nhỏ: chữ nằm ngay dưới ảnh → khối vàng trôi quãng ngắn để không lấn xuống chữ
        const drift = desktop ? 160 : 50;
        gsap.fromTo(one('[data-c="mani-block"]'), { y: drift }, { y: -drift, ease: "none", scrollTrigger: pass });
        gsap.from(one('[data-c="mani-sign"]'), { autoAlpha: 0, ease: "power2.out", scrollTrigger: { trigger: one('[data-c="mani-sign"]'), start: "top 92%", end: "top 65%", scrub: 1 } });
      }

      /* ===== Cảnh 4 · Bản vẽ: nét tự vẽ, phòng lên màu, rồi lao vào ô "Sảnh" cho tới khi ảnh dự án phủ màn hình ===== */
      {
        const bp = one('[data-c="bp"]');
        const svg = bp.querySelector("svg")!;
        const strokes = svg.querySelectorAll("g.pointer-events-none path, g.pointer-events-none line, g.pointer-events-none rect, g.pointer-events-none circle");
        const rooms = Array.from(svg.querySelectorAll<SVGRectElement>("g[tabindex] > rect"));
        const labels = svg.querySelectorAll("g[tabindex] > text");
        const heading = bp.querySelector("h2");
        const aside = bp.querySelector("aside");

        if (desktop) {
          const plan = one('[data-c="bp-plan"]');
          const zoom = one('[data-c="bp-zoom"]');
          const room = rooms[5] ?? rooms[0]; // "Sảnh & ban công"
          // Ô phòng tính theo % khung cảnh → clip-path ban đầu của lớp ảnh trùng khít ô phòng
          const roomInset = () => {
            const s = bp.getBoundingClientRect();
            const r = room.getBoundingClientRect();
            const pct = (v: number, t: number) => `${((v / t) * 100).toFixed(3)}%`;
            return `inset(${pct(r.top - s.top, s.height)} ${pct(s.right - r.right, s.width)} ${pct(s.bottom - r.bottom, s.height)} ${pct(r.left - s.left, s.width)})`;
          };
          const roomOrigin = () => {
            const pr = plan.getBoundingClientRect();
            const r = room.getBoundingClientRect();
            return `${r.left + r.width / 2 - pr.left}px ${r.top + r.height / 2 - pr.top}px`;
          };
          gsap.set(zoom, { autoAlpha: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: bp, start: "top top", end: "+=240%", pin: true, scrub: 1, invalidateOnRefresh: true },
          });
          if (heading) tl.from(heading, { yPercent: 80, autoAlpha: 0, duration: 0.3, ease: "power3.out" }, 0);
          tl.from(strokes, { drawSVG: "0%", duration: 0.8, stagger: 0.012 }, 0.05)
            .from(rooms, { opacity: 0, duration: 0.3, stagger: 0.07 }, 0.45)
            .from(labels, { opacity: 0, y: 14, duration: 0.3, stagger: 0.06 }, 0.55);
          if (aside) tl.from(aside, { x: 90, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 0.7);
          tl.to(room, { fill: P.mint, duration: 0.2 }, 1.25)
            .set(zoom, { autoAlpha: 1 }, 1.45)
            .fromTo(zoom, { clipPath: roomInset }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut", immediateRender: false }, 1.45)
            .fromTo(one('[data-c="bp-zoom-img"]'), { scale: 1.7 }, { scale: 1, duration: 1.1, ease: "power2.inOut", immediateRender: false }, 1.45)
            .to(plan, { scale: 3.2, transformOrigin: roomOrigin, autoAlpha: 0, duration: 1, ease: "power2.in" }, 1.45)
            .from(one('[data-c="bp-zoom-title"]'), { yPercent: 70, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 2.1)
            .to({}, { duration: 0.25 });
        } else {
          const st = { trigger: svg, start: "top 85%", end: "bottom 55%", scrub: 1 };
          gsap.from(strokes, { drawSVG: "0%", stagger: 0.01, ease: "none", scrollTrigger: st });
          gsap.from(rooms, { opacity: 0, stagger: 0.05, ease: "none", scrollTrigger: st });
        }
      }

      /* ===== Cảnh 5 · Bộ sưu tập: đoạn ngang; khung xoay phối cảnh, ảnh + tên trôi ở tốc độ khác nhau ===== */
      {
        const proj = one('[data-c="proj"]');
        const panels = q('[data-c="proj-panel"]') as HTMLElement[];
        const part = (p: HTMLElement, c: string) => p.querySelector<HTMLElement>(`[data-c="${c}"]`)!;

        if (desktop) {
          const track = one('[data-c="proj-track"]');
          const dist = () => track.scrollWidth - window.innerWidth;
          // Cảnh dự án nằm chồng lên màn hình cuối của cảnh bản vẽ: ẩn tới đúng lúc bản vẽ nhả ghim
          // (khung hình hai bên giống hệt nhau) rồi mới hiện → không lộ mối nối
          gsap.set(proj, { autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: proj,
            start: "top top",
            onEnter: () => gsap.set(proj, { autoAlpha: 1 }),
            onLeaveBack: () => gsap.set(proj, { autoAlpha: 0 }),
          });
          const hz = gsap.to(track, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: { trigger: proj, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
          });
          panels.forEach((p) => {
            const range = { trigger: p, containerAnimation: hz, start: "left right", end: "right left", scrub: true };
            gsap
              .timeline({ defaults: { ease: "none" }, scrollTrigger: range })
              .fromTo(part(p, "proj-card"), { scale: 0.92 }, { scale: 1, duration: 1 })
              .to(part(p, "proj-card"), { scale: 0.92, duration: 1 });
            gsap.fromTo(part(p, "proj-pic"), { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: range });
            gsap.from(part(p, "proj-info").children, {
              y: 30,
              autoAlpha: 0,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: { trigger: p, containerAnimation: hz, start: "left 75%", end: "left 15%", scrub: 1 },
            });
          });
          gsap.from(one('[data-c="proj-endlink"]'), {
            scale: 0.8,
            autoAlpha: 0,
            ease: "power2.out",
            // Tấm cuối dừng ở mép phải khi đoạn ngang kết thúc → hiệu ứng phải xong trước khi tâm nút tới 85% bề ngang
            scrollTrigger: { trigger: one('[data-c="proj-endlink"]'), containerAnimation: hz, start: "left right", end: "center 85%", scrub: 1 },
          });
        } else {
          panels.forEach((p) => {
            gsap.fromTo(part(p, "proj-card"), { scale: 0.94, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 95%", end: "top 55%", scrub: true } });
            gsap.fromTo(part(p, "proj-pic"), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
          });
        }
      }

      /* ===== Cảnh 7 · Không gian sống (ghim): cú máy 3D xuyên qua phòng tranh =====
         Timeline cuộn ghi galleryState.progress (scrub làm mượt) → GalleryFlythrough đặt camera theo đó.
         Lớp chữ: tựa trồi lên khi cảnh cuộn vào rồi tan khi camera cất cánh; chú thích ảnh hiện trong lúc bay;
         cuối cảnh phủ dần màu nền của cảnh sau để nối liền. */
      {
        const gal = q('[data-c="gal"]')[0] as HTMLElement | undefined;
        if (gal) {
          galleryState.progress = 0;
          gsap.from(q('[data-c="gal-line"]'), {
            yPercent: 110,
            autoAlpha: 0,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: gal, start: "top 75%", end: "top 15%", scrub: 1 },
          });
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: gal, start: "top top", end: desktop ? "+=420%" : "+=320%", pin: true, scrub: 1 },
            })
            .to(galleryState, { progress: 1, duration: 1 }, 0)
            .to(one('[data-c="gal-intro"]'), { autoAlpha: 0, scale: 1.25, duration: 0.1, ease: "power2.in" }, 0.02)
            .fromTo(one('[data-c="gal-cap"]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.1)
            .to(one('[data-c="gal-cap"]'), { autoAlpha: 0, duration: 0.04 }, 0.9)
            .fromTo(one('[data-c="gal-fade"]'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.94);

          // Cảnh "Câu chuyện" nằm chồng lên màn hình cuối của cú máy (cùng màu nền): ẩn tới đúng lúc nhả ghim rồi mới hiện
          const story = one('[data-c="story"]');
          gsap.set(story, { autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: story,
            start: "top top",
            onEnter: () => gsap.set(story, { autoAlpha: 1 }),
            onLeaveBack: () => gsap.set(story, { autoAlpha: 0 }),
          });
        }
      }

      /* ===== Cảnh 8 · Câu chuyện kiến trúc: các lớp trôi ngược chiều, tiêu đề lao vào từ hai phía ===== */
      {
        const story = one('[data-c="story"]');
        const pass = { trigger: story, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(one('[data-c="st-img"]'), { yPercent: -14 }, { yPercent: 14, ease: "none", scrollTrigger: pass });
        gsap.fromTo(one('[data-c="st-gold"]'), { y: 120 }, { y: -120, ease: "none", scrollTrigger: pass });
        q('[data-c="st-line"]').forEach((l) =>
          gsap.from(l, { y: 40, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: l, start: "top 95%", end: "top 65%", scrub: 1 } }),
        );
        q('[data-c="st-fade"]').forEach((f) => gsap.from(f, { y: 30, autoAlpha: 0, ease: "power2.out", scrollTrigger: { trigger: f, start: "top 95%", end: "top 75%", scrub: 1 } }));
        const counts = gsap.timeline({ scrollTrigger: { trigger: story, start: "top 60%", end: "center 40%", scrub: 1 } });
        q('[data-c="st-count"]').forEach((c, i) => addCounter(counts, c as HTMLElement, i * 0.1));
      }

      /* ===== Cảnh 8 · Tiện ích: các ô bay vào từ hướng ngẫu nhiên, xoay, rồi ráp thành lưới ===== */
      {
        const amen = one('[data-c="amen"]');
        const h = amen.querySelector("h2");
        if (h) gsap.from(h, { y: 40, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 95%", end: "top 65%", scrub: 1 } });
        gsap.from(amen.querySelectorAll("li"), {
          y: 40,
          autoAlpha: 0,
          ease: "power2.out",
          stagger: 0.05,
          scrollTrigger: { trigger: amen.querySelector("ul"), start: "top 95%", end: "top 55%", scrub: 1 },
        });
      }

      /* ===== Cảnh 9 · Hành trình: khối ghim có sẵn; chỉ cho tiêu đề trượt vào ===== */
      {
        const h = one('[data-c="journey"]').querySelector("h2");
        if (h) gsap.from(h, { y: 40, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 95%", end: "top 65%", scrub: 1 } });
      }

      /* ===== Cảnh 10 · Cảm nhận (ghim): thẻ xếp chồng chiều sâu, thẻ trước bay đi, thẻ sau tiến lên ===== */
      {
        const voice = one('[data-c="voice"]');
        const cards = q('[data-c="voice-card"]') as HTMLElement[];
        const depth = (k: number) => ({ z: -k * 260, y: -k * 40, opacity: Math.max(0, 1 - k * 0.3) });
        cards.forEach((c, i) => gsap.set(c, { ...depth(i), zIndex: cards.length - i, transformOrigin: "50% 100%" }));
        gsap.from(voice.querySelector(".cine-voice-head"), { y: 40, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: voice, start: "top 80%", end: "top 20%", scrub: 1 } });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: voice, start: "top top", end: `+=${cards.length * 70}%`, pin: true, scrub: 1 },
        });
        for (let i = 0; i < cards.length - 1; i++) {
          tl.to(cards[i], { yPercent: -130, rotateX: 60, z: 180, opacity: 0, duration: 0.8, ease: "power2.in" }, i + 0.2);
          for (let j = i + 1; j < cards.length; j++) tl.to(cards[j], { ...depth(j - i - 1), duration: 0.8, ease: "power2.out" }, i + 0.35);
        }
        tl.to({}, { duration: 0.4 });
      }

      /* ===== Cảnh 11 · Về nhà (ghim): hai dòng chữ khép lại rồi tách đôi, ngôi nhà về đêm nở ra, lời chào hiện lên ===== */
      {
        const fin = one('[data-c="fin"]');
        const l1 = one('[data-c="fin-l1"]');
        const l2 = one('[data-c="fin-l2"]');
        const frame = one('[data-c="fin-frame"]');
        const welcome = new SplitText(one('[data-c="fin-welcome"]'), { type: "words" });

        gsap
          .timeline({ scrollTrigger: { trigger: fin, start: "top bottom", end: "top top", scrub: 1 } })
          .from(l1, { x: "-60vw", ease: "power3.out" }, 0)
          .from(l2, { x: "60vw", ease: "power3.out" }, 0);

        gsap.set(frame, { clipPath: desktop ? "inset(38% 36% 38% 36% round 24px)" : "inset(42% 22% 42% 22% round 18px)" });
        gsap.set(one('[data-c="fin-img"]'), { scale: 1.4 });
        gsap.set(welcome.words, { yPercent: 100, autoAlpha: 0 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: fin, start: "top top", end: "+=190%", pin: true, scrub: 1 },
          })
          .to(l1, { x: "-110vw", duration: 1, ease: "power2.in" }, 0.1)
          .to(l2, { x: "110vw", duration: 1, ease: "power2.in" }, 0.1)
          .to(frame, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.1, ease: "power2.inOut" }, 0.2)
          .to(one('[data-c="fin-img"]'), { scale: 1, duration: 1.3 }, 0.2)
          .to(one('[data-c="fin-shade"]'), { backgroundColor: "rgba(0,0,0,0.6)", duration: 0.5 }, 1.0)
          .to(welcome.words, { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, 1.15)
          .to({}, { duration: 0.4 });
      }

      /* ===== Tiến độ toàn trang (vạch trên đỉnh) ===== */
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => window.dispatchEvent(new CustomEvent("cine:progress", { detail: self.progress })),
      });

      ScrollTrigger.refresh();
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33); // trả lại mặc định của GSAP cho các trang khác
        lenis.destroy();
        delete el.dataset.cine;
      };
    });

    // Ảnh / font tải xong làm đổi chiều cao → tính lại vị trí các cảnh
    let t = 0;
    const refresh = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const imgs = Array.from(el.querySelectorAll("img"));
    imgs.forEach((img) => !img.complete && img.addEventListener("load", refresh, { once: true }));
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      imgs.forEach((img) => img.removeEventListener("load", refresh));
      mm.revert();
    };
  }, [root]);
}
