import Skeleton from "../../common/Skeleton";

export default function ComposerSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <Skeleton className="h-14 flex-1 rounded-lg" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}
