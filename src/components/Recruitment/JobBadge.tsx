/** Pill nhỏ dạng tag (loại công việc, hình thức...) */
export default function JobBadge({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-medium text-body">
      {children}
    </span>
  );
}
