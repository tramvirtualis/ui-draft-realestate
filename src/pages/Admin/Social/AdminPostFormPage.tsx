import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Globe, Lock, type LucideIcon } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import PostPreview from "../../../components/Admin/posts/PostPreview";
import PostMediaEditor, { EMPTY_MEDIA_CHANGE, isMediaChanged, type PostMediaChange } from "../../../components/Admin/posts/PostMediaEditor";
import RichTextEditor from "../../../components/common/RichTextEditor";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import { useToast } from "../../../components/common/toastContext";
import useUnsavedChangesGuard from "../../../hooks/useUnsavedChangesGuard";
import { getErrorMessage } from "../../../api";
import { adminPostService } from "../../../services/social/adminPostService";
import { htmlToText, isRichTextEmpty, postToEditorHtml } from "../../../utils/richText";
import { selectCurrentUser, useAppSelector } from "../../../store";
import { POST_SCOPE_LABEL, toSocialUser, type AdminPost, type PostScope, type SocialUser } from "../../../types/social/social.types";

const MAX_CONTENT = 20000; // giới hạn số ký tự (gồm cả thẻ định dạng), khớp AdminPostServiceImpl bên BE

const crumb = [
  { label: "Tổng quan", to: "/admin/dashboard" },
  { label: "Cộng đồng" },
  { label: "Quản lý bài đăng", to: "/admin/posts" },
];

const SCOPE_OPTIONS: { value: PostScope; icon: LucideIcon; desc: string }[] = [
  { value: "PUBLIC", icon: Globe, desc: "Ai cũng xem được bài này trên trang cộng đồng." },
  { value: "PRIVATE", icon: Lock, desc: "Chỉ người đăng bài xem được." },
];

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; post: AdminPost };

// Trang tạo bài (/admin/posts/new) và sửa bài (/admin/posts/:id/edit): ảnh + video ở trên, nội dung (trình soạn thảo) ở dưới
export default function AdminPostFormPage() {
  const { id } = useParams();
  // Không có :id trong đường dẫn = tạo bài mới
  const isNew = id === undefined;
  const postId = Number(id);
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (isNew || !Number.isFinite(postId)) return;
    let cancelled = false;
    adminPostService
      .get(postId)
      .then((post) => !cancelled && setLoad({ status: "ready", post }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [isNew, postId]);

  if (isNew) return <PostForm post={null} toast={toast} />;

  if (!Number.isFinite(postId) || load.status === "error") {
    return (
      <div className="px-4 py-24 text-center" role="alert">
        <p className="text-xl font-semibold text-heading">Không tìm thấy bài viết</p>
        <Link to="/admin/posts" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">
          Về danh sách bài đăng
        </Link>
      </div>
    );
  }
  if (load.status === "loading") {
    return (
      <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true" aria-label="Đang tải bài viết">
        <div className="h-32 rounded-2xl bg-primary-100" />
        <div className="mt-6 h-96 rounded-2xl bg-primary-50" />
      </div>
    );
  }

  // Lưu xong vẫn ở lại trang: nạp bài vừa lưu và dựng lại form (key đổi) để xóa trạng thái "chưa lưu"
  const handleSaved = (saved: AdminPost) => {
    setLoad({ status: "ready", post: saved });
    setSavedCount((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <PostForm key={`${load.post.id}-${savedCount}`} post={load.post} onSaved={handleSaved} toast={toast} />;
}

type FormProps = {
  // null = tạo bài mới (admin đăng dưới tên tài khoản của mình)
  post: AdminPost | null;
  onSaved?: (saved: AdminPost) => void;
  toast: ReturnType<typeof useToast>;
};

const NEW_POST_SCOPE: PostScope = "PUBLIC";

function PostForm({ post, onSaved, toast }: FormProps) {
  const navigate = useNavigate();
  const me = useAppSelector(selectCurrentUser);
  const initialContent = useMemo(() => (post ? postToEditorHtml(post.content) : ""), [post]);
  const initialScope = post?.scope ?? NEW_POST_SCOPE;
  const initialActive = post?.active ?? true;
  const savedImages = post?.images ?? [];
  const savedVideoUrl = post?.videoUrl ?? null;
  // Giờ đăng hiện ở khung xem trước khi tạo bài mới
  const [draftCreatedAt] = useState(() => new Date().toISOString());

  const [content, setContent] = useState(initialContent);
  const [scope, setScope] = useState<PostScope>(initialScope);
  const [active, setActive] = useState(initialActive);
  const [media, setMedia] = useState<PostMediaChange>(EMPTY_MEDIA_CHANGE);
  const [saving, setSaving] = useState(false);

  const name = post?.author?.fullName ?? "Người dùng";
  const author: SocialUser = post
    ? toSocialUser(post.author)
    : { id: me?.id ?? 0, fullName: me?.fullName ?? "Quản trị viên", avatarUrl: me?.avatarUrl };
  const dirty = content !== initialContent || scope !== initialScope || active !== initialActive || isMediaChanged(media);

  // Còn thay đổi chưa lưu mà reload / đóng tab / bấm link khác thì hỏi lại
  const guard = useUnsavedChangesGuard(dirty);

  const imagesAfter = savedImages.length - media.removedImageIds.length + media.newImages.length;
  const hasVideoAfter = media.newVideo !== null || (!media.removeVideo && savedVideoUrl !== null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Sau khi sửa bài vẫn phải có nội dung chữ, ảnh hoặc video
    if (isRichTextEmpty(content) && imagesAfter === 0 && !hasVideoAfter) {
      toast.show("Bài viết phải có nội dung, ảnh hoặc video", "error");
      return;
    }
    setSaving(true);
    const input = {
      content: isRichTextEmpty(content) ? "" : content,
      scope,
      active,
      removeImageIds: media.removedImageIds,
      newImages: media.newImages.map((n) => n.file),
      newVideo: media.newVideo?.file ?? null,
      removeVideo: media.removeVideo,
    };
    try {
      if (!post) {
        await adminPostService.createPost(input);
        toast.show("Đã đăng bài viết");
        // Đăng xong về danh sách: bỏ chặn "chưa lưu" trước khi chuyển trang
        guard.allowLeave();
        navigate("/admin/posts");
        return;
      }
      const saved = await adminPostService.edit(post.id, input);
      toast.show("Đã lưu thay đổi bài viết");
      onSaved?.(saved);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[...crumb, { label: post ? "Sửa bài viết" : "Tạo bài viết" }]}
        title={post ? "Sửa bài viết" : "Tạo bài viết"}
        desc={
          post
            ? `Chỉnh sửa nội dung, hình ảnh và video của bài do ${name} đăng.`
            : "Đăng bài mới lên trang cộng đồng dưới tên tài khoản quản trị của bạn."
        }
      >
        {dirty && (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-amber-100 px-4 py-2.5 text-xs font-semibold text-warning">
            <span className="h-2 w-2 rounded-full bg-warning" /> Có thay đổi chưa lưu
          </p>
        )}
      </AdminPageHeader>

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <form onSubmit={submit} noValidate className="space-y-5">
          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="border-b border-line p-6">
              <h2 className="text-xl font-bold text-footer">Hình ảnh &amp; video</h2>
              <p className="mt-1 text-sm text-body">
                {post ? "Xóa, thêm hoặc đổi ảnh và video của bài viết." : "Thêm ảnh hoặc video cho bài viết (không bắt buộc)."}
              </p>
            </div>
            <div className="p-6">
              <PostMediaEditor
                savedImages={savedImages}
                savedVideoUrl={savedVideoUrl}
                value={media}
                onChange={setMedia}
                onError={(m) => toast.show(m, "error")}
                disabled={saving}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-6">
              <div>
                <h2 className="text-xl font-bold text-footer">Nội dung</h2>
                <p className="mt-1 text-sm text-body">Định dạng chữ bằng thanh công cụ bên dưới.</p>
              </div>
              <span className={`text-xs ${content.length >= MAX_CONTENT ? "text-danger" : "text-muted"}`}>
                {htmlToText(content).split(/\s+/).filter(Boolean).length} từ
              </span>
            </div>
            <div className="p-6">
              <RichTextEditor
                value={content}
                onChange={(html) => setContent(html.slice(0, MAX_CONTENT))}
                placeholder="Nhập nội dung bài viết..."
                disabled={saving}
                minHeight={240}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="border-b border-line p-6">
              <h2 className="text-xl font-bold text-footer">Hiển thị</h2>
            </div>
            <div className="space-y-5 p-6">
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive(!active)}
                disabled={saving}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-5 text-left transition disabled:opacity-60 ${
                  active ? "border-success/40 bg-success/5" : "border-line bg-primary-50/40"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-footer">Hiển thị bài trên bảng tin</span>
                  <span className="mt-1 block text-sm text-body">
                    {active
                      ? "Đang bật: bài hiện cho người dùng trên trang cộng đồng."
                      : "Đang tắt: bài bị ẩn, người dùng không thấy trên bảng tin."}
                  </span>
                </span>
                <span className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full transition ${active ? "bg-success" : "bg-muted"}`}>
                  <span className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform ${active ? "translate-x-8" : "translate-x-1"}`} />
                </span>
              </button>

              <div role="radiogroup" aria-label="Phạm vi bài viết">
                <p className="text-lg font-bold text-footer">Phạm vi</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {SCOPE_OPTIONS.map(({ value, icon: Icon, desc }) => {
                    const selected = scope === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setScope(value)}
                        disabled={saving}
                        className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition disabled:opacity-60 ${
                          selected ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100" : "border-line bg-white hover:border-primary-200"
                        }`}
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${selected ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"}`}>
                          <Icon size={22} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-lg font-bold ${selected ? "text-primary-700" : "text-footer"}`}>{POST_SCOPE_LABEL[value]}</span>
                          <span className="mt-1 block text-sm text-body">{desc}</span>
                        </span>
                        <span
                          aria-hidden
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-primary-600" : "border-line"}`}
                        >
                          {selected && <span className="h-3 w-3 rounded-full bg-primary-600" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="border-b border-line p-6">
              <h2 className="text-xl font-bold text-footer">Xem trước</h2>
              <p className="mt-1 text-sm text-body">
                Bài hiển thị cho người dùng như thế này sau khi {post ? "lưu" : "đăng"}, cập nhật ngay theo chỉnh sửa của bạn.
              </p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-full max-w-2xl">
              <PostPreview
                author={author}
                createdAt={post?.createdAt ?? draftCreatedAt}
                scope={scope}
                content={isRichTextEmpty(content) ? "" : content}
                images={[...savedImages.filter((i) => !media.removedImageIds.includes(i.id)).map((i) => i.imageUrl), ...media.newImages.map((n) => n.preview)]}
                videoSrc={media.newVideo?.preview ?? (media.removeVideo ? null : savedVideoUrl)}
                hidden={!active}
              />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => guard.requestLeave("/admin/posts")}
              disabled={saving}
              className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              disabled={saving || !dirty}
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {post ? (saving ? "Đang lưu..." : "Lưu thay đổi") : saving ? "Đang đăng..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </div>

      {guard.target && (
        <ConfirmDialog
          title="Rời khỏi trang?"
          message="Bạn có thay đổi chưa lưu. Nếu rời đi, các thay đổi này sẽ bị mất."
          confirmLabel="Rời trang"
          onConfirm={guard.leave}
          onClose={guard.stay}
        />
      )}
    </>
  );
}
