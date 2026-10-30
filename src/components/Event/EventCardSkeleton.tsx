export default function EventCardSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 border-b border-line py-8 first:pt-0 md:grid-cols-[84px_1fr_280px] md:items-center md:gap-8">
      <div className="hidden h-28 w-[84px] bg-primary-50 md:block" />
      <div className="space-y-3">
        <div className="h-5 w-24 rounded-full bg-primary-50" />
        <div className="h-6 w-3/4 bg-primary-50" />
        <div className="h-4 w-1/2 bg-primary-50" />
        <div className="h-9 w-40 bg-primary-50" />
      </div>
      <div className="order-first aspect-[16/9] bg-primary-50 md:order-none md:aspect-[16/10]" />
    </div>
  );
}
