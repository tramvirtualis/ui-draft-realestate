import { useCallback, useEffect, useState } from "react";
import eventService from "../../services/event/eventService";
import { getErrorMessage } from "../../api/http";
import type { Event } from "../../types/event/event.types";

export function useEventDetail(id: number) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false);
      setError("Sự kiện không hợp lệ");
      return;
    }

    let ignore = false;
    // Tải lại ngầm (sau khi tham gia/rời) thì không hiện skeleton
    if (reloadKey === 0) setLoading(true);
    setError(null);

    eventService
      .getEventById(id)
      .then((res) => !ignore && setEvent(res))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { event, loading, error, refetch };
}
