import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EventDetailHero from "../../components/EventDetail/EventDetailHero";
import EventAbout from "../../components/EventDetail/EventAbout";
import EventRegisterCard from "../../components/EventDetail/EventRegisterCard";
import EventLocation from "../../components/EventDetail/EventLocation";
import EventComments from "../../components/EventDetail/EventComments";
import { useEventDetail } from "../../hooks/event/useEventDetail";
import { useEventComments } from "../../hooks/event/useEventComments";
import { useEventMembership } from "../../hooks/event/useEventMembership";
import { getErrorMessage } from "../../api";
import { selectCurrentUser, useAppSelector } from "../../store";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useAppSelector(selectCurrentUser);
  const { event, loading, error, refetch } = useEventDetail(eventId);
  const { comments, addComment, deleteComment } = useEventComments(eventId);
  const { joined, joining, join, leave } = useEventMembership(
    eventId,
    currentUser?.id ?? null
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventId]);

  // Chưa đăng nhập → sang login, xong quay lại đúng trang này
  const goLogin = () =>
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);

  const handleJoin = async () => {
    if (!currentUser) return goLogin();
    try {
      await join();
      refetch(); // cập nhật số người đã đăng ký
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đăng ký sự kiện này?")) return;
    try {
      await leave();
      refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      await addComment(content);
    } catch (err) {
      window.alert(getErrorMessage(err));
      throw err; // giữ nội dung trong ô nhập
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-16 lg:px-8">
        <div className="h-4 w-48 rounded bg-primary-50" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-12 w-full rounded bg-primary-50" />
            <div className="h-12 w-2/3 rounded bg-primary-50" />
            <div className="h-24 w-full rounded bg-primary-50" />
          </div>
          <div className="aspect-[4/3] rounded-3xl bg-primary-50" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-heading">
          Không tìm thấy sự kiện
        </h1>
        <p className="mt-2 text-body">
          {error ?? "Sự kiện có thể đã bị xóa hoặc đường dẫn không đúng."}
        </p>
        <Link
          to="/events"
          className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <>
      <EventDetailHero event={event} />

      <section className="bg-page py-16 md:py-20">
        <div className="container mx-auto grid items-start gap-12 px-4 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-14">
            <EventAbout event={event} />
            <EventComments
              comments={comments}
              currentUser={currentUser}
              onAdd={handleAddComment}
              onDelete={handleDeleteComment}
            />
          </div>
          <EventRegisterCard
            event={event}
            joined={joined}
            joining={joining}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        </div>
      </section>

      <EventLocation event={event} />
    </>
  );
}
