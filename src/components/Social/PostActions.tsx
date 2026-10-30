import { useState, type CSSProperties } from "react";
import { Forward, Heart, MessagesSquare } from "lucide-react";

// Màu 8 hạt bắn ra quanh trái tim
const BURST = ["bg-rose-500", "bg-amber-400", "bg-sky-400", "bg-violet-500", "bg-rose-400", "bg-emerald-400", "bg-orange-400", "bg-pink-500"];

type Props = {
  likeCount: number;
  commentCount: number;
  // Số lượt chia sẻ
  shareCount?: number;
  liked: boolean;
  onToggleLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
};

// Thanh tương tác gọn một hàng: tim đặc "N lượt thích", bong bóng chat đặc + số bình luận, chia sẻ bên phải
export default function PostActions({
  likeCount,
  commentCount,
  shareCount = 0,
  liked,
  onToggleLike,
  onComment,
  onShare,
}: Props) {
  const item = "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition";
  // Mỗi lần bấm thích tăng 1 → key đổi → hiệu ứng chạy lại từ đầu
  const [burst, setBurst] = useState(0);

  const like = () => {
    if (!liked) setBurst((n) => n + 1);
    onToggleLike();
  };

  return (
    <div className="flex items-center gap-1 border-t border-line pt-3 text-body">
      <button
        onClick={like}
        aria-pressed={liked}
        aria-label={liked ? "Bỏ thích" : "Thích"}
        className={`${item} ${liked ? "text-rose-600" : "hover:bg-rose-50 hover:text-rose-600"}`}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {/* Vòng sóng + hạt bắn: chỉ hiện ngay sau khi bấm thích */}
          {burst > 0 && liked && (
            <span key={`fx-${burst}`} className="pointer-events-none absolute inset-0" aria-hidden>
              <span className="like-ring absolute -inset-1 rounded-full border-2 border-rose-400" />
              {BURST.map((color, i) => (
                <span
                  key={i}
                  className={`like-burst absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full ${color}`}
                  style={{ "--a": `${i * 45}deg` } as CSSProperties}
                />
              ))}
            </span>
          )}
          <Heart
            key={`heart-${burst}`}
            size={19}
            className={`${burst > 0 && liked ? "like-pop" : ""} ${liked ? "fill-rose-500 text-rose-500" : "fill-[#5b6b8c] text-[#5b6b8c]"}`}
          />
        </span>
        <span>
          <b key={`count-${likeCount}`} className={`font-semibold ${burst > 0 ? "like-count" : ""}`}>
            {likeCount}
          </b>{" "}
          lượt thích
        </span>
      </button>
      <button onClick={onComment} aria-label="Bình luận" className={`${item} hover:bg-sky-50 hover:text-sky-600`}>
        <MessagesSquare size={19} className="fill-[#5b6b8c] text-[#5b6b8c]" />
        <b className="font-semibold">{commentCount}</b>
      </button>
      <button
        onClick={onShare}
        className={`${item} ml-auto hover:bg-violet-50 hover:text-violet-600`}
        aria-label={shareCount > 0 ? `Chia sẻ (${shareCount} lượt)` : "Chia sẻ"}
      >
        <Forward size={19} />
        <span>{shareCount > 0 ? shareCount : "Chia sẻ"}</span>
      </button>
    </div>
  );
}
