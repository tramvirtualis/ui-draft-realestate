import Skeleton from "../../common/Skeleton";

// Khung chờ của 1 bài viết; withMedia: có khối ảnh to ở giữa
export default function PostCardSkeleton({ withMedia = true }: { withMedia?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-11/12 rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
      </div>

      {withMedia && <Skeleton className="mb-3 h-64 w-full rounded-lg" />}

      <div className="flex items-center gap-6 border-t border-gray-100 pt-3">
        <Skeleton className="h-6 w-14 rounded-lg" />
        <Skeleton className="h-6 w-14 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    </div>
  );
}
