import { useCallback, useEffect, useState } from "react";
import eventService from "../../services/event/eventService";
import type { GetEventsParams } from "../../services/event/eventService";
import { getErrorMessage } from "../../api/http";
import type { Event, PageResponse } from "../../types/event/event.types";

const emptyPage = (size: number): PageResponse<Event> => ({
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size,
});

export function useEvents({ filter, sort, page, size }: GetEventsParams) {
  const [data, setData] = useState<PageResponse<Event>>(() => emptyPage(size));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    eventService
      .getEvents({ filter: JSON.parse(filterKey), sort, page, size })
      .then((res) => {
        if (!ignore) setData(res);
      })
      .catch((err) => {
        if (ignore) return;
        setData(emptyPage(size));
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filterKey, sort, page, size, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}
