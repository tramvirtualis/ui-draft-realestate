import { useCallback, useEffect, useState } from "react";
import eventService from "../../services/event/eventService";
import type { EventMember } from "../../types/event/event.types";

/**
 Danh sách thành viên + trạng thái "đã tham gia" của user hiện tại.
 Chỉ gọi khi đã đăng nhập: members dùng authHttp, khách gọi sẽ bị đẩy về trang login.
 */
export function useEventMembership(eventId: number, userId: number | null) {
  const [members, setMembers] = useState<EventMember[]>([]);
  const [joining, setJoining] = useState<boolean>(false);

  useEffect(() => {
    if (userId === null || !Number.isInteger(eventId) || eventId <= 0) {
      setMembers([]);
      return;
    }

    let ignore = false;
    eventService
      .getMembers(eventId)
      .then((res) => !ignore && setMembers(res))
      .catch(() => !ignore && setMembers([]));

    return () => {
      ignore = true;
    };
  }, [eventId, userId]);

  const joined = userId !== null && members.some((m) => m.user.id === userId);

  const join = useCallback(async () => {
    setJoining(true);
    try {
      const member = await eventService.joinEvent(eventId);
      setMembers((prev) => [...prev, member]);
    } finally {
      setJoining(false);
    }
  }, [eventId]);

  const leave = useCallback(async () => {
    setJoining(true);
    try {
      await eventService.leaveEvent(eventId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } finally {
      setJoining(false);
    }
  }, [eventId, userId]);

  return { members, joined, joining, join, leave };
}
