// Khối giữ chỗ khi đang tải, truyền kích thước/bo góc qua className (vd "h-4 w-32 rounded")
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}
