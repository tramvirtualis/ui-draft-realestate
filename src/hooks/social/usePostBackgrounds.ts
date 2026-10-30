import { useEffect, useState } from "react";
import { postBackgroundService } from "../../services/social/postBackgroundService";
import type { PostBackground } from "../../types/social/social.types";

// Danh sách màu nền ít khi đổi: tải 1 lần rồi dùng lại cho cả phiên; lỗi thì coi như không có nền nào
let cache: Promise<PostBackground[]> | null = null;

// Admin vừa thêm / sửa / tắt màu nền: lần mở ô đăng bài sau sẽ tải lại danh sách
export const clearPostBackgroundsCache = () => {
  cache = null;
};

export function usePostBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<PostBackground[]>([]);

  useEffect(() => {
    let cancelled = false;
    cache ??= postBackgroundService.list().catch(() => {
      cache = null;
      return [];
    });
    cache.then((list) => !cancelled && setBackgrounds(list));
    return () => {
      cancelled = true;
    };
  }, []);

  return backgrounds;
}
