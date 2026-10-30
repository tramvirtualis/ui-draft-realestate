import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../components/common/toastContext";
import postService from "../../services/social/postService";
import { toSocialPost, type SocialPost } from "../../types/social/social.types";
import { decodePostCode } from "../../utils/postCode";

const PARAM = "post";

// Mở link chia sẻ /social?post=<mã>: giải mã id, tải bài rồi trả về để trang mở modal bài viết.
// Mã sai / bài đã ẩn / riêng tư thì báo lỗi và bỏ tham số khỏi URL
export function usePostFromUrl() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const code = params.get(PARAM);
  // Bài đã tải kèm mã của nó: URL đổi sang mã khác / bỏ mã thì tự coi như chưa có bài
  const [loaded, setLoaded] = useState<{ code: string; post: SocialPost } | null>(null);
  const post = loaded && loaded.code === code ? loaded.post : null;

  // Đóng modal = bỏ ?post khỏi URL (replace để nút Back không mở lại modal)
  const close = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(PARAM);
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  useEffect(() => {
    if (!code) return;
    const id = decodePostCode(code);
    if (id === null) {
      toast.show("Liên kết bài viết không hợp lệ", "error");
      close();
      return;
    }
    let cancelled = false;
    postService
      .getPost(id)
      .then((res) => !cancelled && setLoaded({ code, post: toSocialPost(res) }))
      .catch(() => {
        if (cancelled) return;
        toast.show("Bài viết không tồn tại hoặc bạn không có quyền xem", "error");
        close();
      });
    return () => {
      cancelled = true;
    };
  }, [code, close, toast]);

  return { post, close };
}
