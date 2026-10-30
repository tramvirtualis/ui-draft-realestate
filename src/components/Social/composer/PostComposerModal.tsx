import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import Avatar from "../../common/Avatar";
import ErrorAlert from "../../common/ErrorAlert";
import useFocusTrap from "../../common/useFocusTrap";
import ComposerAddBar from "./ComposerAddBar";
import ComposerBackgroundPicker from "./ComposerBackgroundPicker";
import ComposerImagePreviews from "./ComposerImagePreviews";
import ComposerVideoPreview from "./ComposerVideoPreview";
import ScopeSelect from "./ScopeSelect";
import { backgroundBoxClass, backgroundTextSize } from "../post/postBackground";
import { usePostBackgrounds } from "../../../hooks/social/usePostBackgrounds";
import type { PostComposerState } from "../../../hooks/social/usePostComposer";
import { POST_VIDEO_TYPES, type SocialUser } from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  composer: PostComposerState;
  onClose: () => void;
};

// Modal "Tạo bài viết" giống Facebook: người đăng + phạm vi, ô nhập (hoặc khung màu nền), màu nền, ảnh / video, nút Đăng.
// Đóng modal không mất bài nháp vì state nằm ở PostComposer
export default function PostComposerModal({ user, composer: c, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const backgrounds = usePostBackgrounds();
  // Đang đăng thì không cho đóng, tránh tưởng đã hủy mà bài vẫn lên
  const close = () => !c.submitting && onClose();
  useFocusTrap(root, true, close);

  // useFocusTrap focus nút đầu tiên (nút đóng); đặt con trỏ vào cuối ô nhập để gõ tiếp luôn.
  // Mở lại với bài nháp dài: giãn ô nhập ngay (useAutoResizeTextarea chỉ chạy khi nội dung đổi)
  useEffect(() => {
    const el = c.textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [c.textareaRef]);

  const submit = async () => {
    if (await c.submit()) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={close}>
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <header className="relative border-b border-gray-200 py-3 text-center">
          <h2 id="composer-title" className="text-lg font-bold">Tạo bài viết</h2>
          <button
            type="button"
            onClick={close}
            disabled={c.submitting}
            aria-label="Đóng"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-10 w-10" />
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <ScopeSelect value={c.scope} onChange={c.setScope} disabled={c.submitting} align="left" />
            </div>
          </div>

          {/* Có màu nền: ô nhập thành khung màu, chữ to canh giữa */}
          <div
            className={c.background ? backgroundBoxClass : ""}
            style={c.background ? { background: c.background.value, color: c.background.textColor } : undefined}
          >
            <textarea
              ref={c.textareaRef}
              value={c.content}
              onChange={(e) => c.setContent(e.target.value)}
              maxLength={c.maxLength}
              disabled={c.submitting}
              placeholder={`${user.fullName} ơi, bạn đang nghĩ gì?`}
              aria-label="Nội dung bài viết"
              rows={c.background ? 1 : 4}
              className={
                c.background
                  ? `w-full resize-none overflow-hidden bg-transparent text-center font-bold outline-none placeholder:text-current placeholder:opacity-70 ${backgroundTextSize(c.content.length)}`
                  : `max-h-[40vh] w-full resize-none overflow-y-auto outline-none ${c.content.length <= 85 && !c.hasMedia ? "text-2xl" : "text-base"}`
              }
            />
          </div>

          {/* Bài có ảnh / video thì không dùng màu nền */}
          {!c.hasMedia && (
            <ComposerBackgroundPicker
              backgrounds={backgrounds}
              selectedId={c.background?.id ?? null}
              onSelect={c.chooseBackground}
              disabled={c.submitting}
              disabledReason={c.background ? null : c.backgroundBlockedReason}
            />
          )}

          <ComposerImagePreviews urls={c.imagePreviews} disabled={c.submitting} onRemove={c.removeImage} />
          <ComposerVideoPreview
            file={c.video}
            url={c.videoPreview}
            unplayable={c.videoUnplayable}
            disabled={c.submitting}
            onUnplayable={c.markVideoUnplayable}
            onRemove={c.removeVideo}
          />
          <ErrorAlert message={c.error} onClose={c.clearError} className="mt-3" />

          <input ref={c.imageInputRef} type="file" accept="image/*" multiple hidden onChange={c.pickImages} />
          <input ref={c.videoInputRef} type="file" accept={POST_VIDEO_TYPES.join(",")} hidden onChange={c.pickVideo} />

          <ComposerAddBar
            imageCount={c.images.length}
            mediaDisabled={c.background !== null}
            disabled={c.submitting}
            onPickImages={c.openImagePicker}
            onPickVideo={c.openVideoPicker}
            onEmoji={c.insertEmoji}
          />

          <button
            type="button"
            onClick={() => void submit()}
            disabled={!c.canSubmit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {c.submitting && <Loader2 size={16} className="animate-spin" />}
            {c.submitting ? "Đang đăng..." : "Đăng"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
