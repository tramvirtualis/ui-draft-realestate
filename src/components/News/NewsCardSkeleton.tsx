export default function NewsCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-primary-50" />
      <div className="space-y-3 pt-5">
        <div className="h-3 w-24 bg-primary-50" />
        <div className="h-5 w-full bg-primary-50" />
        <div className="h-5 w-2/3 bg-primary-50" />
        <div className="h-3 w-1/2 bg-primary-50" />
      </div>
    </div>
  );
}
