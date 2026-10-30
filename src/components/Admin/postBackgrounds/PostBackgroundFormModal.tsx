import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../../common/useFocusTrap";
import {
  DARK_TEXT,
  GRADIENT_ANGLES,
  WHITE_TEXT,
  buildBackgroundCss,
  isHexColor,
  parseBackgroundCss,
  suggestTextColor,
  type BackgroundDraft,
  type BackgroundKind,
} from "./backgroundCss";
import type { AdminPostBackground, PostBackgroundInput } from "../../../types/social/social.types";

type Props = {
  item: AdminPostBackground | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (input: PostBackgroundInput) => void;
  onClose: () => void;
};

const field = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";
const segment = (on: boolean) =>
  `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${on ? "bg-white text-primary-700 shadow-sm" : "text-body hover:text-heading"}`;

const NEW_DRAFT: BackgroundDraft = { kind: "gradient", from: "#f97316", to: "#db2777", angle: 135 };

// Một ô chọn màu: bảng màu của trình duyệt + ô nhập mã #rrggbb
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <label className="block min-w-0 flex-1">
      <span className="text-sm font-semibold text-footer">{label}</span>
      <span className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
          aria-label={`${label} (bảng màu)`}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1"
        />
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (isHexColor(e.target.value)) onChange(e.target.value);
          }}
          maxLength={7}
          spellCheck={false}
          className={`${field} h-11 font-mono uppercase`}
        />
      </span>
    </label>
  );
}

export default function PostBackgroundFormModal({ item, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const [name, setName] = useState(item?.name ?? "");
  const [draft, setDraft] = useState<BackgroundDraft>(item ? parseBackgroundCss(item.value) : NEW_DRAFT);
  const [textColor, setTextColor] = useState(item?.textColor ?? suggestTextColor(NEW_DRAFT));
  // Admin tự chọn màu chữ rồi thì thôi tự gợi ý theo màu nền
  const [textColorTouched, setTextColorTouched] = useState(!!item);
  const [active, setActive] = useState(item?.active ?? true);
  const [error, setError] = useState("");

  const changeDraft = (patch: Partial<BackgroundDraft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (!textColorTouched) setTextColor(suggestTextColor(next));
  };

  const chooseTextColor = (color: string) => {
    setTextColorTouched(true);
    setTextColor(color);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Nhập tên màu nền");
    if (!isHexColor(draft.from) || (draft.kind === "gradient" && !isHexColor(draft.to))) {
      return setError("Mã màu phải có dạng #RRGGBB");
    }
    setError("");
    onSubmit({ name: name.trim(), value: buildBackgroundCss(draft), textColor, active });
  };

  const preview = buildBackgroundCss(draft);
  const kinds: { value: BackgroundKind; label: string }[] = [
    { value: "solid", label: "Màu trơn" },
    { value: "gradient", label: "Chuyển màu" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="background-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="background-form-title" className="text-xl font-bold text-footer">
            {item ? "Chỉnh sửa màu nền" : "Thêm màu nền"}
          </h2>
          <p className="mt-1 text-sm text-body">Người dùng chọn màu nền này khi đăng bài chỉ có chữ ở trang Cộng đồng.</p>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          {/* Xem trước y như bài viết trên bảng tin */}
          <div
            className="flex min-h-40 items-center justify-center rounded-xl px-6 py-8 text-center text-2xl font-bold transition-colors"
            style={{ background: preview, color: textColor }}
            aria-label="Xem trước màu nền"
          >
            Hôm nay bạn thế nào?
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên màu nền <span className="text-danger">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Ví dụ: Hoàng hôn" className={`${field} mt-1.5 h-11`} />
          </label>

          <div>
            <span className="text-sm font-semibold text-footer">Kiểu nền</span>
            <div className="mt-1.5 flex gap-1 rounded-xl bg-primary-50 p-1" role="radiogroup" aria-label="Kiểu nền">
              {kinds.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  role="radio"
                  aria-checked={draft.kind === k.value}
                  onClick={() => changeDraft({ kind: k.value })}
                  className={segment(draft.kind === k.value)}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <ColorField label={draft.kind === "solid" ? "Màu nền" : "Màu bắt đầu"} value={draft.from} onChange={(from) => changeDraft({ from })} />
            {draft.kind === "gradient" && <ColorField label="Màu kết thúc" value={draft.to} onChange={(to) => changeDraft({ to })} />}
          </div>

          {draft.kind === "gradient" && (
            <div>
              <span className="text-sm font-semibold text-footer">Hướng chuyển màu</span>
              <div className="mt-1.5 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {GRADIENT_ANGLES.map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => changeDraft({ angle })}
                    aria-pressed={draft.angle === angle}
                    aria-label={`Góc ${angle} độ`}
                    title={`${angle}°`}
                    className={`h-10 rounded-lg border-2 transition ${draft.angle === angle ? "border-primary-600" : "border-transparent"}`}
                    style={{ background: buildBackgroundCss({ ...draft, angle }) }}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-sm font-semibold text-footer">Màu chữ</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {[
                { color: WHITE_TEXT, label: "Trắng" },
                { color: DARK_TEXT, label: "Đen" },
              ].map((o) => (
                <button
                  key={o.color}
                  type="button"
                  onClick={() => chooseTextColor(o.color)}
                  aria-pressed={textColor === o.color}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${
                    textColor === o.color ? "border-primary-600 text-primary-700" : "border-line text-heading hover:bg-primary-50"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border border-line" style={{ background: o.color }} />
                  {o.label}
                </button>
              ))}
              <label className="flex items-center gap-2 text-sm text-body">
                hoặc
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => chooseTextColor(e.target.value)}
                  aria-label="Màu chữ khác"
                  className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                />
              </label>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-primary-600" />
            <span className="text-sm text-heading">Cho phép người dùng chọn màu nền này</span>
          </label>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm màu nền"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
