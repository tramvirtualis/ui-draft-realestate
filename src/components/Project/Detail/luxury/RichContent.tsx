import { isHtml, sanitizeHtml } from "../../../../utils/richText";

type Props = { content: string; className?: string };

// Hiển thị nội dung từ backend: HTML (rich text) được làm sạch, văn bản thuần tách đoạn theo dòng
export default function RichContent({ content, className = "" }: Props) {
  if (isHtml(content)) {
    return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
  }
  const paragraphs = content.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`rich-content ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
