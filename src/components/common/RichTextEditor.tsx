import { useEffect, useRef, useState } from "react";
import LinkDialog from "./LinkDialog";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, Link2Off, List, ListOrdered, Loader2, Minus, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2,
  type LucideIcon,
} from "lucide-react";

// Căn lề đoạn văn / tiêu đề: TipTap ghi style="text-align: ..." (BE giữ style cho p, h1-h6)
const ALIGNS: { value: "left" | "center" | "right" | "justify"; label: string; icon: LucideIcon }[] = [
  { value: "left", label: "Căn trái", icon: AlignLeft },
  { value: "center", label: "Căn giữa", icon: AlignCenter },
  { value: "right", label: "Căn phải", icon: AlignRight },
  { value: "justify", label: "Căn đều", icon: AlignJustify },
];

type Props = {
  value: string; // HTML
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  // Có truyền thì hiện nút chèn ảnh: upload file rồi trả về URL (null = upload lỗi)
  onUploadImage?: (file: File) => Promise<string | null>;
};

type ToolButtonProps = { label: string; icon: LucideIcon; active?: boolean; disabled?: boolean; onClick: () => void };

function ToolButton({ label, icon: Icon, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // giữ vùng chọn trong editor khi bấm nút
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 ${
        active ? "bg-primary-100 text-primary-700" : "text-heading hover:bg-primary-50"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden />;

// Trình soạn thảo văn bản (TipTap): đậm, nghiêng, gạch chân, tiêu đề, danh sách, trích dẫn, liên kết...
export default function RichTextEditor({ value, onChange, placeholder, disabled, minHeight = 260, onUploadImage }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const imagePicker = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      // StarterKit v3 đã gồm Underline và Link
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } } }),
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ...(onUploadImage ? [Image] : []),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: { class: "rich-content focus:outline-none", style: `min-height:${minHeight}px` },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? "" : ed.getHTML()),
  });

  // Nội dung được nạp bất đồng bộ (trang sửa) hoặc đổi từ bên ngoài
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const openLinkDialog = () => {
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  };

  const applyLink = (url: string) => {
    setLinkOpen(false);
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // không chọn chữ nào: chèn luôn đường dẫn làm chữ của liên kết
      editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const removeLink = () => {
    setLinkOpen(false);
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  const chain = () => editor.chain().focus();

  const insertImage = async (file: File | undefined) => {
    if (!file || !onUploadImage) return;
    setUploading(true);
    const url = await onUploadImage(file);
    setUploading(false);
    if (url) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
  };

  return (
    <div className={`rounded-xl border border-line bg-white transition focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-primary-50/50 px-2 py-1.5">
        <ToolButton label="Đậm" icon={Bold} active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()} />
        <ToolButton label="Nghiêng" icon={Italic} active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()} />
        <ToolButton label="Gạch chân" icon={UnderlineIcon} active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()} />
        <ToolButton label="Gạch ngang" icon={Strikethrough} active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()} />
        <Divider />
        <ToolButton label="Tiêu đề lớn" icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="Tiêu đề nhỏ" icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
        <Divider />
        {ALIGNS.map((a) => (
          <ToolButton
            key={a.value}
            label={a.label}
            icon={a.icon}
            // Chưa căn gì thì coi như đang căn trái
            active={a.value === "left" ? !ALIGNS.some((x) => x.value !== "left" && editor.isActive({ textAlign: x.value })) : editor.isActive({ textAlign: a.value })}
            onClick={() => (a.value === "left" ? chain().unsetTextAlign().run() : chain().setTextAlign(a.value).run())}
          />
        ))}
        <Divider />
        <ToolButton label="Danh sách dấu đầu dòng" icon={List} active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()} />
        <ToolButton label="Danh sách đánh số" icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()} />
        <ToolButton label="Trích dẫn" icon={Quote} active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()} />
        <ToolButton label="Đường kẻ ngang" icon={Minus} onClick={() => chain().setHorizontalRule().run()} />
        <Divider />
        <ToolButton label="Chèn liên kết" icon={Link2} active={editor.isActive("link")} onClick={openLinkDialog} />
        <ToolButton label="Gỡ liên kết" icon={Link2Off} disabled={!editor.isActive("link")} onClick={() => chain().extendMarkRange("link").unsetLink().run()} />
        {onUploadImage && (
          <>
            <ToolButton
              label={uploading ? "Đang tải ảnh..." : "Chèn ảnh"}
              icon={uploading ? Loader2 : ImagePlus}
              disabled={uploading || disabled}
              onClick={() => imagePicker.current?.click()}
            />
            <input
              ref={imagePicker}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                insertImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </>
        )}
        <Divider />
        <ToolButton label="Hoàn tác" icon={Undo2} disabled={!editor.can().undo()} onClick={() => chain().undo().run()} />
        <ToolButton label="Làm lại" icon={Redo2} disabled={!editor.can().redo()} onClick={() => chain().redo().run()} />
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
      {linkOpen && <LinkDialog initialUrl={linkUrl} onApply={applyLink} onRemove={removeLink} onClose={() => setLinkOpen(false)} />}
    </div>
  );
}
