import { Globe, Lock } from "lucide-react";
import AdminModal from "../AdminModal";
import { formatDate, formatTime } from "../../../utils/formatDate";
import type { AdminPost } from "../../../types/social/social.types";

type Props = { post: AdminPost; onClose: () => void };

// Xem đầy đủ một bài (kể cả bài riêng tư mà trang cộng đồng không cho admin xem)
export default function PostDetailModal({ post, onClose }: Props) {
  const name = post.author?.fullName ?? "Người dùng";
  const isPrivate = post.scope === "PRIVATE";

  return (
    <AdminModal title="Chi tiết bài viết" onClose={onClose}>
      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center gap-3">
          {post.author?.avatarUrl ? (
            <img src={post.author.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-heading">{name}</p>
            <p className="flex items-center gap-1.5 text-xs text-body">
              {formatDate(post.createdAt)} · {formatTime(post.createdAt)}
              <span aria-hidden>·</span>
              {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
              {isPrivate ? "Riêng tư" : "Công khai"}
              {!post.active && <span className="rounded-full bg-line px-2 py-0.5 font-semibold text-body">Đang ẩn</span>}
            </p>
          </div>
        </div>

        {post.content ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-heading">{post.content}</p>
        ) : (
          <p className="text-sm italic text-muted">Bài viết không có nội dung chữ.</p>
        )}

        {post.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.imageUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl bg-primary-50">
                <img src={url} alt="" loading="lazy" className="h-40 w-full object-cover" />
              </a>
            ))}
          </div>
        )}

        {post.videoUrl && <video src={post.videoUrl} controls preload="metadata" className="w-full rounded-xl bg-black" />}
      </div>
    </AdminModal>
  );
}
