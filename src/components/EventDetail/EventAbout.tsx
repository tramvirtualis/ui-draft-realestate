import type { Event } from "../../types/event/event.types";

// Giới thiệu sự kiện: tiêu đề có vạch đậm phía trên, nội dung giữ xuống dòng như admin nhập
export default function EventAbout({ event }: { event: Event }) {
  return (
    <div>
      <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-heading">
        Giới thiệu sự kiện <span className="h-px flex-1 bg-heading/80" />
      </p>
      <p className="mt-6 whitespace-pre-line text-base leading-8 text-body">{event.content}</p>
    </div>
  );
}
