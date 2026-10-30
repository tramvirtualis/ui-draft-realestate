import { useCallback, useEffect, useRef, useState } from "react";
import postService from "../../services/social/postService";
import { getErrorMessage } from "../../api/http";
import type { CreatePostRequest, PostResponse, PostScope, SharePostRequest } from "../../types/social/social.types";

// Gộp trang mới vào danh sách, bỏ trùng id (bài vừa đăng làm lệch offset phân trang)
const mergeUnique = (prev: PostResponse[], next: PostResponse[]) => {
  const ids = new Set(prev.map((p) => p.id));
  return [...prev, ...next.filter((p) => !ids.has(p.id))];
};

// userId: chỉ lấy bài của người đó; không truyền thì lấy cả bảng tin
export function usePosts(userId?: number, size = 10) {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  // Đã xong lần tải đầu (dù lỗi hay không): dùng để chỉ hiện skeleton cả trang 1 lần
  const [initialized, setInitialized] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    let ignore = false;
    busy.current = true;
    setLoading(true);
    setError(null);

    postService
      .getPosts(0, size, userId)
      .then((res) => {
        if (ignore) return;
        setPosts(res.content);
        setPage(0);
        setHasMore(res.number + 1 < res.totalPages);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => {
        if (ignore) return;
        busy.current = false;
        setLoading(false);
        setInitialized(true);
      });

    return () => {
      ignore = true;
    };
  }, [size, userId, reloadKey]);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const res = await postService.getPosts(page + 1, size, userId);
      setPosts((prev) => mergeUnique(prev, res.content));
      setPage(res.number);
      setHasMore(res.number + 1 < res.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, page, size, userId]);

  // Lỗi được ném ra để bên gọi hiển thị (composer giữ nguyên nội dung/ảnh đang chọn)
  const createPost = useCallback(async (request: CreatePostRequest) => {
    const created = await postService.createPost(request);
    setPosts((prev) => [created, ...prev]);
    return created;
  }, []);

  // Chia sẻ bài: bài chia sẻ mới lên đầu danh sách (trừ khi đang xem trang của người khác),
  // bài gốc ở mọi chỗ trong danh sách (bài thường hoặc nhúng trong bài chia sẻ) tăng lượt chia sẻ.
  // Lỗi được ném ra để bên gọi hiển thị
  const sharePost = useCallback(
    async (postId: number, request: SharePostRequest) => {
      const created = await postService.sharePost(postId, request);
      const rootId = created.sharedPostId;
      const bump = (p: PostResponse): PostResponse => (p.id === rootId ? { ...p, shareCount: p.shareCount + 1 } : p);
      setPosts((prev) => {
        const updated = prev.map((p) => ({ ...bump(p), sharedPost: p.sharedPost && bump(p.sharedPost) }));
        return userId === undefined || userId === created.author.id ? [created, ...updated] : updated;
      });
      return created;
    },
    [userId],
  );

  // Người đăng đổi phạm vi bài của mình; lỗi được ném ra để bên gọi hiển thị
  const updateScope = useCallback(async (postId: number, scope: PostScope) => {
    const updated = await postService.updateScope(postId, scope);
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, scope: updated.scope } : p)));
  }, []);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    posts,
    loading,
    initialized,
    loadingMore,
    error,
    hasMore,
    loadMore,
    createPost,
    sharePost,
    updateScope,
    refetch,
  };
}
