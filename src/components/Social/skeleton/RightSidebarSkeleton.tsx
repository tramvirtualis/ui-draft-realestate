import Skeleton from "../../common/Skeleton";

export default function RightSidebarSkeleton() {
  return (
    <aside className="hidden space-y-6 xl:block">
      {/* Được tài trợ */}
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-24 rounded" />
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Quảng cáo dự án */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <Skeleton className="h-72 w-full" />
        <div className="space-y-2 p-4">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </aside>
  );
}
