import { useEffect, useState } from "react";
import EventsHero from "../../components/Event/EventsHero";
import EventList from "../../components/Event/EventList";
import EventFilterBar from "../../components/Event/EventFilterBar";
import { useEvents } from "../../hooks/event/useEvents";
import {
  DEFAULT_EVENT_FILTER,
  EVENT_SORT,
  type Event,
  type EventFilter,
  type EventSort,
} from "../../types/event/event.types";

const PAGE_SIZE = 6;

export default function EventsPage() {
  const [filter, setFilter] = useState(DEFAULT_EVENT_FILTER);
  const [sort, setSort] = useState<EventSort>(EVENT_SORT.NEWEST);
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useEvents({
    filter,
    sort,
    page,
    size: PAGE_SIZE,
  });

  // Hero giữ cố định theo lần tải đầu (không đổi theo bộ lọc / trang đang xem)
  const [featured, setFeatured] = useState<Event[]>([]);
  useEffect(() => {
    if (!featured.length && data.content.length) setFeatured(data.content);
  }, [data.content, featured.length]);

  const handleSearch = (newFilter: EventFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  const handleSortChange = (newSort: EventSort) => {
    setSort(newSort);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <EventsHero events={featured} />
      <EventList
        filterBar={<EventFilterBar value={filter} onSearch={handleSearch} />}
        events={data.content}
        total={data.totalElements}
        loading={loading}
        error={error}
        onRetry={refetch}
        sort={sort}
        onSortChange={handleSortChange}
        page={page}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
        onReset={() => handleSearch(DEFAULT_EVENT_FILTER)}
      />
    </>
  );
}
