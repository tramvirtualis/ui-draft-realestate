import Skeleton from "../../common/Skeleton";

const card = "rounded-2xl border border-line bg-white p-4";

export default function LeftSidebarSkeleton() {
  return (
    <aside className="hidden space-y-6 lg:block">
      {/* Thẻ người dùng */}
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      {/* Menu */}
      <div className="space-y-2 rounded-2xl border border-line bg-white p-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>

      {/* Gợi ý theo dõi */}
      <div className={`${card} space-y-3`}>
        <Skeleton className="h-3.5 w-24 rounded" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>

      {/* Tin tức */}
      <div className={`${card} space-y-3`}>
        <Skeleton className="h-3.5 w-16 rounded" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
