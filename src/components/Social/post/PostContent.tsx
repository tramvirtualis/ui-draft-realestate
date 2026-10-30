import { useToggle } from "../../../hooks/social/useToggle";
import { htmlToText, isRichPost, sanitizeHtml } from "../../../utils/richText";

// Bài dài hơn số ký tự này thì cắt bớt và hiện nút "Xem thêm"
const MAX_PREVIEW_CHARS = 200;

type Props = {
  content: string;
  /** false: luôn hiện đủ (dùng trong modal bài viết) */
  collapsible?: boolean;
};

export default function PostContent({ content, collapsible = true }: Props) {
  const expanded = useToggle(false);
  if (!content) return null;

  // Bài admin đã sửa bằng trình soạn thảo là HTML; bài người dùng đăng là chữ thuần
  const rich = isRichPost(content);
  const text = rich ? htmlToText(content) : content;
  const collapsed = collapsible && !expanded.value && text.length > MAX_PREVIEW_CHARS;

  if (rich && !collapsed) {
    return <div className="rich-content mb-3 text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
  }

  return (
    <p className="mb-3 whitespace-pre-line text-sm text-gray-800">
      {collapsed ? `${text.slice(0, MAX_PREVIEW_CHARS).trimEnd()}... ` : content}
      {collapsed && (
        <button onClick={expanded.setOn} className="font-semibold text-gray-500 hover:underline">
          Xem thêm
        </button>
      )}
    </p>
  );
}
