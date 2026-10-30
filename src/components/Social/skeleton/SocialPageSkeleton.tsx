import ComposerSkeleton from "./ComposerSkeleton";
import LeftSidebarSkeleton from "./LeftSidebarSkeleton";
import PostCardSkeleton from "./PostCardSkeleton";
import RightSidebarSkeleton from "./RightSidebarSkeleton";
import { SOCIAL_GRID } from "../socialLayout";

// Khung chờ cả trang Cộng đồng, cùng lưới 3 cột với trang thật để tải xong không bị nhảy bố cục
export default function SocialPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải bảng tin"
      className={SOCIAL_GRID}
    >
      <LeftSidebarSkeleton />
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <ComposerSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton withMedia={false} />
        <PostCardSkeleton />
      </div>
      <RightSidebarSkeleton />
    </div>
  );
}
