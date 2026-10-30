import { useEffect, useState } from "react";
import eventService from "../../services/event/eventService";
import type { Event } from "../../types/event/event.types";

// Sự kiện mới nhất cho sidebar trang Cộng đồng
export function useLatestEvents(limit = 5) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    eventService
      .getLatestEvents(limit)
      .then((res) => !ignore && setEvents(res))
      .catch(() => {
        /* lỗi tải sự kiện: sidebar để trống, không chặn bảng tin */
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [limit]);

  return { events, loading };
}
