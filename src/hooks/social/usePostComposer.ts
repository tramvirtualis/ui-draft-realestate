import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { getErrorMessage } from "../../api/http";
import { useToast } from "../../components/common/toastContext";
import { formatFileSize, insertAtCursor } from "../../utils/text";
import {
  POST_BACKGROUND_MAX_CONTENT_LENGTH,
  POST_MAX_CONTENT_LENGTH,
  POST_MAX_IMAGES,
  POST_MAX_VIDEO_SIZE,
  POST_SCOPE,
  POST_VIDEO_TYPES,
  type CreatePostRequest,
  type PostBackground,
  type PostScope,
} from "../../types/social/social.types";
import { useAutoResizeTextarea } from "./useAutoResizeTextarea";
import { useObjectUrl, useObjectUrls } from "./useObjectUrls";

export type PostComposerState = ReturnType<typeof usePostComposer>;

// Toàn bộ state/logic của ô đăng bài: nội dung, ảnh, video, màu nền, lỗi, gửi.
// Nằm ở thẻ ngoài bảng tin nên đóng modal vẫn giữ bài nháp
export function usePostComposer(onSubmit: (request: CreatePostRequest) => Promise<unknown>) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [scope, setScope] = useState<PostScope>(POST_SCOPE.PUBLIC);
  // Màu nền cho bài chỉ có chữ; có ảnh / video thì không dùng được
  const [background, setBackground] = useState<PostBackground | null>(null);
  const [videoUnplayable, setVideoUnplayable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Lỗi chọn ảnh / video hiện ngay trong modal; kết quả đăng bài (thành công / lỗi BE) báo bằng toast
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imagePreviews = useObjectUrls(images);
  const videoPreview = useObjectUrl(video);
  useAutoResizeTextarea(textareaRef, content);

  const openImagePicker = useCallback(() => imageInputRef.current?.click(), []);
  const openVideoPicker = useCallback(() => videoInputRef.current?.click(), []);

  const pickImages = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!picked.length) return;
    const next = [...images, ...picked];
    setError(next.length > POST_MAX_IMAGES ? `Mỗi bài viết tối đa ${POST_MAX_IMAGES} ảnh` : null);
    setImages(next.slice(0, POST_MAX_IMAGES));
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  // Kiểm tra trước ở FE để khỏi upload 20MB rồi mới bị BE từ chối
  const pickVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!POST_VIDEO_TYPES.includes(file.type)) {
      setError(`"${file.name}" không hợp lệ. Video chỉ hỗ trợ định dạng MP4, WEBM hoặc MOV`);
      return;
    }
    if (file.size > POST_MAX_VIDEO_SIZE) {
      setError(
        `"${file.name}" nặng ${formatFileSize(file.size)}, vượt quá giới hạn ${formatFileSize(POST_MAX_VIDEO_SIZE)}`,
      );
      return;
    }
    setError(null);
    setVideoUnplayable(false);
    setVideo(file);
  };

  const removeVideo = () => setVideo(null);

  const maxLength = background ? POST_BACKGROUND_MAX_CONTENT_LENGTH : POST_MAX_CONTENT_LENGTH;
  const hasMedia = images.length > 0 || video !== null;
  // Chữ dài hơn giới hạn của bài có nền thì không cho chọn nền (Facebook cũng vậy)
  const backgroundBlockedReason =
    content.length > POST_BACKGROUND_MAX_CONTENT_LENGTH
      ? `Bài có màu nền tối đa ${POST_BACKGROUND_MAX_CONTENT_LENGTH} ký tự`
      : null;

  const insertEmoji = (emoji: string) => setContent((c) => insertAtCursor(textareaRef.current, c, emoji, maxLength));

  const chooseBackground = (bg: PostBackground | null) => {
    setBackground(bg);
    textareaRef.current?.focus();
  };

  // Bài có nền bắt buộc có chữ; bài thường cần chữ, ảnh hoặc video
  const canSubmit =
    (background ? content.trim().length > 0 : content.trim().length > 0 || hasMedia) && !submitting;

  // true = đăng thành công (bên gọi đóng modal); lỗi thì giữ nguyên bài nháp và báo lỗi bằng toast
  const submit = async () => {
    if (!canSubmit) return false;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ content, images, video, scope, backgroundId: background?.id ?? null });
      setContent("");
      setImages([]);
      setVideo(null);
      setBackground(null);
      toast.show(scope === POST_SCOPE.PRIVATE ? "Đã đăng bài viết ở chế độ chỉ mình tôi" : "Đã đăng bài viết");
      return true;
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    textareaRef,
    images,
    imagePreviews,
    imageInputRef,
    openImagePicker,
    pickImages,
    removeImage,
    scope,
    setScope,
    background,
    chooseBackground,
    backgroundBlockedReason,
    hasMedia,
    maxLength,
    video,
    videoPreview,
    videoUnplayable,
    markVideoUnplayable: () => setVideoUnplayable(true),
    videoInputRef,
    openVideoPicker,
    pickVideo,
    removeVideo,
    insertEmoji,
    error,
    clearError: () => setError(null),
    submitting,
    canSubmit,
    submit,
  };
}
