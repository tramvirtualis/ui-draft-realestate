// Nhận diện nguồn video để chọn cách phát: nhúng YouTube / Vimeo, thẻ <video> cho file, hoặc mở liên kết
export type VideoSource =
  | { kind: "youtube"; id: string; embed: string; poster: string }
  | { kind: "vimeo"; id: string; embed: string; poster: null }
  | { kind: "file"; src: string; poster: null }
  | { kind: "link"; src: string; poster: null };

const YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/i;
const FILE = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

// Video dự án / tiến độ chỉ nhận link YouTube (khớp YoutubeLink bên BE)
export const isYoutubeUrl = (url: string): boolean => YOUTUBE.test(url.trim());

export function parseVideoSource(url: string): VideoSource {
  const yt = YOUTUBE.exec(url);
  if (yt) {
    return {
      kind: "youtube",
      id: yt[1],
      embed: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`,
      poster: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const vm = VIMEO.exec(url);
  if (vm) return { kind: "vimeo", id: vm[1], embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1`, poster: null };
  // Video upload lên Cloudinary có dạng .../video/upload/...
  if (FILE.test(url) || url.includes("/video/upload/")) return { kind: "file", src: url, poster: null };
  return { kind: "link", src: url, poster: null };
}
