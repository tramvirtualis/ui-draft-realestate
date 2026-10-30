type Props = {
  src: string | null;
  /** Chiều cao tối đa, ví dụ "max-h-[420px]" */
  maxHeight?: string;
};

export default function PostVideo({ src, maxHeight = "max-h-[420px]" }: Props) {
  if (!src) return null;
  return (
    <div className="mb-3 overflow-hidden rounded-lg bg-black">
      <video src={src} controls preload="metadata" className={`${maxHeight} w-full`} />
    </div>
  );
}
