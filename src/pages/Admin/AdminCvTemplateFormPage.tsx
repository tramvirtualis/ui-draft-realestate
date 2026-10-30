import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Code2,
  FileCode2,
  ImagePlus,
  Info,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import CvTemplateA4Preview from "../../components/Admin/cvTemplates/CvTemplateA4Preview";
import CvTemplateBuilderPanel from "../../components/Admin/cvTemplates/CvTemplateBuilderPanel";
import ColorPicker from "../../components/CvBuilder/ColorPicker";
import {
  DEFAULT_BUILDER,
  builderSectionOrder,
  generateTemplate,
  readBuilder,
  resolveBuilderSource,
  type BuilderOptions,
} from "../../components/Admin/cvTemplates/templateBuilder";
import { applyTemplateOrder } from "../../components/CvBuilder/cvHelpers";
import { SAMPLE_CV_DATA_LONG, SAMPLE_CV_STYLE } from "../../data/sampleCvData";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminCvTemplateService } from "../../services/job/adminCvTemplateService";
import {
  STARTER_CONFIG,
  STARTER_CSS,
  STARTER_HTML,
} from "../../components/CvBuilder/templates/starterTemplate";
import { TEMPLATE_VARIABLES } from "../../components/CvBuilder/templates/handlebarsTemplate";
import { CV_FONTS, CV_FONT_SIZES } from "../../types/job/cv.types";
import type {
  CvTemplateConfig,
  CvTemplateInput,
} from "../../types/job/cvTemplate.types";

const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600 disabled:bg-gray-50";
const code =
  "h-[420px] w-full resize-y rounded-xl border border-line bg-[#1e1b2e] p-4 font-mono text-[12.5px] leading-relaxed text-[#e9e6ff] outline-none focus:border-primary-600";
const MAX_THUMB_MB = 10;

interface FormState {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
  htmlContent: string;
  cssContent: string;
  color: string;
  font: string;
  fontSize: number;
  extraConfig: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  active: false,
  htmlContent: "",
  cssContent: "",
  color: String(STARTER_CONFIG.color),
  font: String(STARTER_CONFIG.font),
  fontSize: Number(STARTER_CONFIG.fontSize),
  extraConfig: "{}",
};

type Tab = "html" | "css" | "vars";
type Mode = "builder" | "code";

function splitConfig(config: CvTemplateConfig | null) {
  const { color, font, fontSize, builder, ...rest } = config ?? {};
  return {
    color: typeof color === "string" ? color : EMPTY.color,
    font: typeof font === "string" ? font : EMPTY.font,
    fontSize: typeof fontSize === "number" ? fontSize : EMPTY.fontSize,
    extraConfig: JSON.stringify(rest, null, 2),
  };
}

// JSON không hợp lệ hoặc không phải object thì trả null */
function parseExtra(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text.trim() || "{}");
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

// Ghi thứ tự mục vào JSON cấu hình thêm (giữ nguyên nếu JSON đang lỗi)
function withSectionOrder(extraJson: string, order: string[]): string {
  const extra = parseExtra(extraJson);
  return extra
    ? JSON.stringify({ ...extra, sectionOrder: order }, null, 2)
    : extraJson;
}

/** Tab trong ô code chèn 2 dấu cách thay vì nhảy sang ô khác */
function insertTab(
  e: KeyboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void
) {
  if (e.key !== "Tab" || e.shiftKey) return;
  e.preventDefault();
  const el = e.currentTarget;
  const { selectionStart: start, selectionEnd: end, value } = el;
  onChange(value.slice(0, start) + "  " + value.slice(end));
  requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
}

export default function AdminCvTemplateFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [mode, setMode] = useState<Mode>("builder");
  const [builder, setBuilder] = useState<BuilderOptions>(DEFAULT_BUILDER);
  // Mẫu đang có code viết tay: vẫn mở ở Thiết kế nhanh nhưng giữ nguyên code (xem trước + lưu)
  // cho tới khi admin chỉnh một lựa chọn bất kỳ
  const [legacy, setLegacy] = useState(false);
  // Vừa bỏ code viết tay để dùng Thiết kế nhanh → hiện nút "Giữ thiết kế cũ"
  const [replacingCode, setReplacingCode] = useState(false);
  // Xem thử với CV dài để thấy mẫu tự sang trang mới
  const [longSample, setLongSample] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>("html");
  const [loading, setLoading] = useState(editId !== null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (editId === null) return;
    adminCvTemplateService
      .get(editId)
      .then((t) => {
        setForm({
          name: t.name,
          slug: t.slug,
          description: t.description ?? "",
          sortOrder: t.sortOrder,
          active: t.active,
          htmlContent: t.htmlContent,
          cssContent: t.cssContent ?? "",
          ...splitConfig(t.defaultConfig),
        });
        setThumbnailUrl(t.thumbnailUrl);
        // Luôn mở ở Thiết kế nhanh; mẫu có code khác với thiết kế đã lưu thì giữ code đó.
        // Mẫu do Thiết kế nhanh sinh ra (bản cũ hơn) vẫn tính là Thiết kế nhanh, chỉ sinh lại mã
        const saved = readBuilder(t.defaultConfig?.builder) ?? DEFAULT_BUILDER;
        const gen = generateTemplate(saved);
        const fromBuilder = resolveBuilderSource(t) !== t;
        setBuilder(saved);
        setLegacy(
          !fromBuilder &&
            (gen.htmlContent !== t.htmlContent ||
              gen.cssContent !== (t.cssContent ?? ""))
        );
      })
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        navigate("/admin/cv-templates");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Ảnh chọn từ máy: tạo URL tạm để xem trước, thu hồi khi đổi ảnh
  const thumbPreview = useMemo(
    () => (thumbFile ? URL.createObjectURL(thumbFile) : null),
    [thumbFile]
  );
  useEffect(
    () => () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    },
    [thumbPreview]
  );

  const extra = useMemo(() => parseExtra(form.extraConfig), [form.extraConfig]);
  const usingBuilder = mode === "builder" && !legacy;
  const config = useMemo<CvTemplateConfig>(
    () => ({
      ...(extra ?? {}),
      color: form.color,
      font: form.font,
      fontSize: form.fontSize,
      // chỉ lưu cấu trúc khi đang dùng Thiết kế nhanh: phía ứng viên dựng lại mẫu từ đó,
      // mẫu giữ code tay mà kèm builder sẽ bị thay bằng thiết kế nhanh
      ...(usingBuilder
        ? { builder, sectionOrder: builderSectionOrder(builder) }
        : {}),
    }),
    [extra, form.color, form.font, form.fontSize, usingBuilder, builder]
  );

  const generated = useMemo(() => generateTemplate(builder), [builder]);
  const content = usingBuilder
    ? generated
    : { htmlContent: form.htmlContent, cssContent: form.cssContent };
  // Xem trước theo thứ tự mục mặc định của mẫu
  const previewOrder = Array.isArray(config.sectionOrder)
    ? applyTemplateOrder(config.sectionOrder, SAMPLE_CV_STYLE.sectionOrder)
    : undefined;

  // Gõ code liên tục thì preview render trễ một nhịp, ô nhập không bị giật
  const source = useMemo(
    () => ({ ...content, defaultConfig: config }),
    [content.htmlContent, content.cssContent, config] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const previewSource = useDeferredValue(source);

  const pickThumb = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.show("Ảnh xem trước phải là file ảnh", "error");
      return;
    }
    if (file.size > MAX_THUMB_MB * 1024 * 1024) {
      toast.show(`Ảnh tối đa ${MAX_THUMB_MB}MB`, "error");
      return;
    }
    setThumbFile(file);
  };

  const changeBuilder = (next: BuilderOptions) => {
    setBuilder(next);
    if (legacy) {
      setLegacy(false);
      setReplacingCode(true);
    }
  };

  const keepCode = () => {
    setLegacy(true);
    setReplacingCode(false);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (next === "code") {
      // mang thiết kế hiện tại (cả thứ tự mục) sang làm điểm bắt đầu để sửa code
      if (!legacy) {
        setForm((f) => ({
          ...f,
          ...generated,
          extraConfig: withSectionOrder(
            f.extraConfig,
            builderSectionOrder(builder)
          ),
        }));
      }
    } else {
      // code đã sửa tay thì giữ lại cho tới khi admin chỉnh Thiết kế nhanh
      setLegacy(
        !!form.htmlContent.trim() &&
          (form.htmlContent !== generated.htmlContent ||
            form.cssContent !== generated.cssContent)
      );
    }
    setReplacingCode(false);
    setMode(next);
  };

  const applyStarter = () => {
    if (
      form.htmlContent.trim() &&
      !window.confirm("Thay nội dung HTML/CSS hiện tại bằng mẫu khởi đầu?")
    )
      return;
    setForm((f) => ({
      ...f,
      htmlContent: STARTER_HTML,
      cssContent: STARTER_CSS,
    }));
    setTab("html");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim() || !content.htmlContent.trim()) {
      toast.show("Vui lòng nhập tên mẫu và nội dung HTML", "error");
      return;
    }
    if (!extra) {
      toast.show(
        'Cấu hình thêm phải là JSON object hợp lệ, vd {"showAvatar": true}',
        "error"
      );
      return;
    }
    const input: CvTemplateInput = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      htmlContent: content.htmlContent,
      cssContent: content.cssContent,
      defaultConfig: config,
      active: form.active,
      sortOrder: form.sortOrder,
    };

    setSaving(true);
    try {
      const saved =
        editId === null
          ? await adminCvTemplateService.add(input)
          : await adminCvTemplateService.edit(editId, input);
      if (thumbFile) {
        try {
          await adminCvTemplateService.uploadThumbnail(saved.id, thumbFile);
        } catch (err) {
          // Mẫu đã lưu; chỉ ảnh lỗi → chuyển sang trang sửa để admin thử lại
          toast.show(
            `Đã lưu mẫu nhưng tải ảnh thất bại: ${getErrorMessage(err)}`,
            "error"
          );
          navigate(`/admin/cv-templates/${saved.id}/edit`, { replace: true });
          setThumbFile(null);
          setThumbnailUrl(saved.thumbnailUrl);
          return;
        }
      }
      toast.show(editId === null ? "Đã tạo mẫu CV" : "Đã cập nhật mẫu CV");
      navigate("/admin/cv-templates");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const title = editId === null ? "Thêm mẫu CV" : "Sửa mẫu CV";
  const shownThumb = thumbPreview ?? thumbnailUrl;

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Quản lý template CV", to: "/admin/cv-templates" },
          { label: title },
        ]}
        title={title}
        desc="Chọn bố cục, màu sắc và kiểu chữ — bản xem trước bên phải cập nhật ngay với dữ liệu CV mẫu."
      />

      <form
        onSubmit={submit}
        className="-mt-16 grid gap-6 px-4 pb-10 md:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
        aria-busy={loading}
      >
        <div className="space-y-6">
          {/* Thông tin chung */}
          <section className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-heading">Thông tin mẫu</h2>
            <label className="block text-sm font-semibold text-heading">
              Tên mẫu <span className="text-danger">*</span>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={100}
                required
                placeholder="Vd: Hiện đại – cột tím"
                disabled={loading}
                className={field}
              />
            </label>
            <label className="block text-sm font-semibold text-heading">
              Mô tả ngắn
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Ứng viên thấy dòng này khi rê chuột vào mẫu"
                disabled={loading}
                className={field}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-heading">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                disabled={loading}
                className="h-4 w-4 accent-primary-600"
              />
              Hiển thị cho ứng viên
              <span className="font-normal text-muted">
                (bỏ chọn để lưu nháp)
              </span>
            </label>

            <details className="rounded-xl border border-line px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-body">
                Tùy chọn nâng cao
              </summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <label className="block text-sm font-semibold text-heading">
                  Đường dẫn (slug)
                  <input
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value.toLowerCase())}
                    maxLength={120}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    title="Chữ thường không dấu, số và dấu gạch ngang"
                    placeholder="Bỏ trống để tự tạo từ tên"
                    disabled={loading}
                    className={`${field} font-mono`}
                  />
                </label>
                <label className="block text-sm font-semibold text-heading">
                  Thứ tự
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) =>
                      set("sortOrder", Math.max(0, Number(e.target.value)))
                    }
                    disabled={loading}
                    className={field}
                  />
                </label>
              </div>
            </details>
          </section>

          {/* Màu, font mặc định + ảnh xem trước */}
          <section className="grid gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-heading">
                <Palette size={16} /> Màu sắc &amp; chữ
              </h2>
              <p className="-mt-2 text-xs text-body">
                Mặc định khi ứng viên chọn mẫu này; ứng viên vẫn đổi được sau
                đó.
              </p>
              <ColorPicker
                value={form.color}
                onChange={(color) => set("color", color)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-heading">
                  Font chữ
                  <select
                    value={form.font}
                    onChange={(e) => set("font", e.target.value)}
                    disabled={loading}
                    className={field}
                  >
                    {CV_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-heading">
                  Cỡ chữ
                  <select
                    value={form.fontSize}
                    onChange={(e) => set("fontSize", Number(e.target.value))}
                    disabled={loading}
                    className={field}
                  >
                    {CV_FONT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}px
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-heading">
                <ImagePlus size={16} /> Ảnh đại diện mẫu
              </h2>
              <label className="mt-3 flex aspect-[210/297] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 text-center text-xs text-muted transition hover:border-primary-400">
                {shownThumb ? (
                  <img
                    src={shownThumb}
                    alt="Ảnh xem trước mẫu"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <span className="px-4">
                    Bấm để chọn ảnh chụp mẫu (tối đa {MAX_THUMB_MB}MB)
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pickThumb(e.target.files?.[0])}
                  disabled={loading}
                />
              </label>
              {thumbFile && (
                <p
                  className="mt-2 truncate text-xs text-body"
                  title={thumbFile.name}
                >
                  Sẽ tải lên khi lưu: {thumbFile.name}
                </p>
              )}
            </div>
          </section>

          {/* Thiết kế: chọn nhanh hoặc viết code */}
          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold text-heading">Thiết kế</h2>
              <div
                className="flex rounded-xl bg-gray-100 p-1"
                role="tablist"
                aria-label="Cách thiết kế"
              >
                {(
                  [
                    ["builder", "Thiết kế nhanh", Wand2],
                    ["code", "Viết code (nâng cao)", Code2],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    disabled={loading}
                    onClick={() => switchMode(value)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      mode === value
                        ? "bg-white text-primary-700 shadow-sm"
                        : "text-body hover:text-heading"
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {mode === "builder" ? (
              <div className="space-y-4 p-6">
                {legacy && (
                  <p className="flex items-start gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-body">
                    <Info
                      size={16}
                      className="mt-0.5 shrink-0 text-primary-600"
                    />
                    <span>
                      Mẫu này đang dùng thiết kế viết bằng code, bản xem trước
                      bên phải là thiết kế đó. Chọn hoặc kéo thả bất kỳ thành
                      phần nào bên dưới để chuyển sang Thiết kế nhanh.
                    </span>
                  </p>
                )}
                {replacingCode && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-warning/10 px-4 py-3 text-sm text-body">
                    <span>
                      Đã chuyển sang Thiết kế nhanh — thiết kế viết bằng code
                      trước đó sẽ bị thay khi lưu.
                    </span>
                    <button
                      type="button"
                      onClick={keepCode}
                      className="font-semibold text-primary-700 hover:underline"
                    >
                      Giữ thiết kế cũ
                    </button>
                  </div>
                )}
                <CvTemplateBuilderPanel
                  value={builder}
                  onChange={changeBuilder}
                  color={form.color}
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 pt-3">
                  <div
                    className="flex gap-1"
                    role="tablist"
                    aria-label="Nội dung mẫu"
                  >
                    {(
                      [
                        ["html", "HTML (Handlebars)"],
                        ["css", "CSS"],
                        ["vars", "Biến & helper"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        onClick={() => setTab(value)}
                        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                          tab === value
                            ? "border-primary-600 text-primary-700"
                            : "border-transparent text-body hover:text-heading"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={applyStarter}
                    disabled={loading}
                    className="mb-3 flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
                  >
                    <Sparkles size={14} /> Dùng mẫu khởi đầu
                  </button>
                </div>

                <div className="space-y-4 p-6">
                  {tab === "html" && (
                    <textarea
                      value={form.htmlContent}
                      onChange={(e) => set("htmlContent", e.target.value)}
                      onKeyDown={(e) =>
                        insertTab(e, (v) => set("htmlContent", v))
                      }
                      spellCheck={false}
                      disabled={loading}
                      aria-label="HTML của mẫu"
                      className={code}
                    />
                  )}
                  {tab === "css" && (
                    <>
                      <textarea
                        value={form.cssContent}
                        onChange={(e) => set("cssContent", e.target.value)}
                        onKeyDown={(e) =>
                          insertTab(e, (v) => set("cssContent", v))
                        }
                        spellCheck={false}
                        disabled={loading}
                        aria-label="CSS của mẫu"
                        className={code}
                      />
                      <p className="flex items-start gap-1.5 text-xs text-body">
                        <Info size={14} className="mt-px shrink-0" />
                        CSS tự giới hạn trong vùng CV nên không ảnh hưởng
                        website. Không hỗ trợ @import / @font-face — font có
                        sẵn: {CV_FONTS.map((f) => f.label).join(", ")}.
                      </p>
                    </>
                  )}
                  {tab === "vars" && (
                    <div className="max-h-[440px] overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {TEMPLATE_VARIABLES.map((v) => (
                            <tr
                              key={v.name}
                              className="border-b border-line last:border-0"
                            >
                              <td className="py-2.5 pr-4 align-top font-mono text-xs text-primary-700">
                                {v.name}
                              </td>
                              <td className="py-2.5 text-body">{v.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="mt-3 text-xs text-body">
                        Dữ liệu ứng viên luôn được escape, nên mẫu không chèn
                        được HTML từ nội dung CV. Thẻ &lt;script&gt; và thuộc
                        tính on* trong mẫu sẽ bị bỏ khi render.
                      </p>
                    </div>
                  )}

                  <label className="block text-sm font-semibold text-heading">
                    Cấu hình thêm (JSON) — dùng trong mẫu qua{" "}
                    <code className="font-mono text-primary-700">
                      {"{{config.tenKhoa}}"}
                    </code>
                    <textarea
                      value={form.extraConfig}
                      onChange={(e) => set("extraConfig", e.target.value)}
                      onKeyDown={(e) =>
                        insertTab(e, (v) => set("extraConfig", v))
                      }
                      rows={3}
                      spellCheck={false}
                      disabled={loading}
                      aria-invalid={!extra}
                      className={`${field} font-mono text-xs ${
                        extra ? "" : "border-danger focus:border-danger"
                      }`}
                    />
                    {!extra && (
                      <span className="mt-1 block text-xs font-normal text-danger">
                        JSON không hợp lệ (phải là object, vd{" "}
                        {'{ "showAvatar": true }'})
                      </span>
                    )}
                  </label>
                </div>
              </>
            )}
          </section>

          <div className="flex justify-end gap-3">
            <Link
              to="/admin/cv-templates"
              className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
            >
              Hủy
            </Link>
            <button
              disabled={saving || loading}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu mẫu"}
            </button>
          </div>
        </div>

        {/* Xem trước */}
        <aside className="xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-heading">
                <FileCode2 size={16} /> Xem trước
              </h2>
              <label className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-body">
                <input
                  type="checkbox"
                  checked={longSample}
                  onChange={(e) => setLongSample(e.target.checked)}
                  className="h-4 w-4 accent-primary-600"
                />
                Thử CV dài
              </label>
            </div>
            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-gray-100 p-4">
              {loading ? (
                <div
                  className="mx-auto aspect-[210/297] max-w-md animate-pulse rounded bg-white"
                  aria-busy="true"
                  aria-label="Đang tải mẫu"
                />
              ) : (
                <CvTemplateA4Preview
                  template={previewSource}
                  style={{
                    color: form.color,
                    font: form.font,
                    fontSize: form.fontSize,
                    ...(previewOrder && { sectionOrder: previewOrder }),
                  }}
                  data={longSample ? SAMPLE_CV_DATA_LONG : undefined}
                  scopeId={editId === null ? "admin-new" : `admin-${editId}`}
                />
              )}
            </div>
          </section>
        </aside>
      </form>
    </>
  );
}
