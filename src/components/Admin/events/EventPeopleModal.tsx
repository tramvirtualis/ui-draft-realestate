import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminModal from "../AdminModal";
import ConfirmDialog from "../ConfirmDialog";
import { useToast } from "../../common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminEventService } from "../../../services/event/adminEventService";
import { formatDate, formatTime } from "../../../utils/formatDate";
import type {
  Event,
  EventComment,
  EventMember,
  UserSummary,
} from "../../../types/event/event.types";

type Tab = "members" | "comments";
const PAGE_SIZE = 20;

function Avatar({ user }: { user: UserSummary }) {
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
      {user.fullName?.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

const when = (iso: string) => `${formatTime(iso)} · ${formatDate(iso)}`;

export default function EventPeopleModal({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<EventMember[] | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [commentPages, setCommentPages] = useState(1);
  const [loadingComments, setLoadingComments] = useState(true);
  const [deleting, setDeleting] = useState<EventComment | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminEventService
      .getMembers(event.id)
      .then(setMembers)
      .catch((err) => {
        setMembers([]);
        toast.show(getErrorMessage(err), "error");
      });
  }, [event.id]);

  useEffect(() => {
    let cancelled = false;
    setLoadingComments(true);
    adminEventService
      .getComments(event.id, commentPage, PAGE_SIZE)
      .then((p) => {
        if (cancelled) return;
        setComments((cur) =>
          commentPage === 0 ? p.content : [...cur, ...p.content]
        );
        setCommentTotal(p.totalElements);
        setCommentPages(p.totalPages);
      })
      .catch((err) => !cancelled && toast.show(getErrorMessage(err), "error"))
      .finally(() => !cancelled && setLoadingComments(false));
    return () => {
      cancelled = true;
    };
  }, [event.id, commentPage]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminEventService.removeComment(event.id, deleting.id);
      setComments((cur) => cur.filter((c) => c.id !== deleting.id));
      setCommentTotal((n) => Math.max(0, n - 1));
      toast.show("Đã xóa bình luận");
      setDeleting(null);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const tabBtn = (key: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => setTab(key)}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        tab === key
          ? "border-primary-600 text-primary-700"
          : "border-transparent text-body hover:text-heading"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <AdminModal title={event.title} onClose={onClose}>
        <div
          className="flex gap-1 border-b border-line px-6"
          role="tablist"
          aria-label="Thông tin sự kiện"
        >
          {tabBtn(
            "members",
            `Người tham gia (${members?.length ?? event.attendeeCount})`
          )}
          {tabBtn("comments", `Bình luận (${commentTotal})`)}
        </div>

        <div className="min-h-[260px] px-6 py-4">
          {tab === "members" ? (
            members === null ? (
              <div className="animate-pulse space-y-3" aria-busy="true">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="h-11 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="py-10 text-center text-sm text-body">
                Chưa có ai tham gia sự kiện này.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <Avatar user={m.user} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-heading">
                      {m.user.fullName}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      Tham gia {when(m.joinedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : comments.length === 0 && loadingComments ? (
            <div className="animate-pulse space-y-3" aria-busy="true">
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-primary-50" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-body">
              Chưa có bình luận nào.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3 py-3">
                    <Avatar user={c.user} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-heading">
                          {c.user.fullName}
                        </span>
                        <span className="ml-2 text-xs text-muted">
                          {when(c.createdAt)}
                        </span>
                      </p>
                      <p className="mt-0.5 whitespace-pre-line break-words text-sm text-body">
                        {c.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleting(c)}
                      aria-label={`Xóa bình luận của ${c.user.fullName}`}
                      title="Xóa bình luận"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-danger transition hover:bg-danger/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              {commentPage < commentPages - 1 && (
                <button
                  type="button"
                  disabled={loadingComments}
                  onClick={() => setCommentPage((p) => p + 1)}
                  className="mt-3 w-full rounded-lg border border-line py-2 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-60"
                >
                  {loadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </>
          )}
        </div>
      </AdminModal>

      {deleting && (
        <ConfirmDialog
          title="Xóa bình luận?"
          message={`Xóa bình luận của ${
            deleting.user.fullName
          }: "${deleting.content.slice(0, 80)}${
            deleting.content.length > 80 ? "…" : ""
          }"`}
          busy={busy}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
