import { useCallback, useMemo, useState } from "react";
import { selectAuthStatus, selectCurrentUser, useAppSelector } from "../../store";
import { toSocialPost, type SocialUser } from "../../types/social/social.types";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { usePosts } from "./usePosts";

// Dữ liệu cho trang Cộng đồng: người đang đăng nhập (null = khách), bảng tin (cuộn vô hạn), menu đang chọn
export function useSocialFeed() {
  const authStatus = useAppSelector(selectAuthStatus);
  const authUser = useAppSelector(selectCurrentUser);
  // Người đang được xem trang cá nhân; null = bảng tin chung
  const [viewUser, setViewUser] = useState<SocialUser | null>(null);
  const feed = usePosts(viewUser?.id);
  const sentinelRef = useInfiniteScroll(feed.loadMore, feed.hasMore);

  const currentUser = useMemo<SocialUser | null>(
    () =>
      authUser && {
        id: authUser.id,
        fullName: authUser.fullName,
        avatarUrl: authUser.avatarUrl,
      },
    [authUser],
  );

  // Biết chắc là khách hay đã có GET /users/me thì mới vẽ trang, tránh nháy giao diện khách
  const authReady =
    authStatus === "unauthenticated" || (authStatus === "authenticated" && currentUser !== null);

  const posts = useMemo(() => feed.posts.map(toSocialPost), [feed.posts]);

  // Mục đang chọn ở menu trái: xem chính mình → "profile", bảng tin chung → "feed", xem người khác → không mục nào
  const activeMenu = !viewUser ? "feed" : viewUser.id === currentUser?.id ? "profile" : "";

  // Đổi giữa bảng tin / trang cá nhân / trang người khác: trượt mượt lên đầu trang rồi mới hiện danh sách mới
  const showUserPosts = useCallback((user: SocialUser | null) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    setViewUser(user);
  }, []);

  const selectMenu = useCallback(
    (id: string) => {
      if (id === "profile" && currentUser) showUserPosts(currentUser);
      else if (id === "feed") showUserPosts(null);
    },
    [currentUser, showUserPosts],
  );

  return {
    ...feed,
    posts,
    currentUser,
    authReady,
    viewUser,
    showUserPosts,
    activeMenu,
    selectMenu,
    sentinelRef,
  };
}
