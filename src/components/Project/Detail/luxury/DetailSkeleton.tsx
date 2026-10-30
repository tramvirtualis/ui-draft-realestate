// Khung chờ cho trang chi tiết: giữ đúng bố cục hero + thẻ thông tin nhanh để không bị nhảy trang
export default function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải thông tin dự án" role="status" className="overflow-x-clip">
      <div className="min-h-[70svh] animate-pulse bg-gradient-to-b from-primary-200 to-primary-100" />
      <div className="container relative z-10 mx-auto -mt-20 px-4 lg:px-8">
        <div className="grid animate-pulse gap-3 rounded-[2rem] bg-white/80 p-3 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-primary-50" />
          ))}
        </div>
        <div className="mt-16 grid animate-pulse gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-primary-100" />
            <div className="h-12 w-3/4 rounded bg-primary-100" />
            <div className="h-4 rounded bg-primary-50" />
            <div className="h-4 w-11/12 rounded bg-primary-50" />
            <div className="h-4 w-10/12 rounded bg-primary-50" />
          </div>
          <div className="h-72 rounded-3xl bg-primary-50" />
        </div>
      </div>
    </div>
  );
}
