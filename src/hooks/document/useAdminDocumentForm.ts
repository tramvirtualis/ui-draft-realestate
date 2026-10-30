import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminDocumentService } from "../../services/document/adminDocumentService";
import { isRichTextEmpty } from "../../utils/richText";
import {
  DOCX_MIME,
  PDF_MIME,
  type DocumentCategory,
  type DocumentInput,
  type DocumentItem,
} from "../../types/document.types";

const EMPTY: DocumentInput = {
  type: "FILE",
  categoryId: null,
  title: "",
  slug: "",
  description: "",
  content: "",
  published: true,
  removeFile: false,
  removeThumbnail: false,
};

const MB = 1024 * 1024;
const MAX_PDF = 20 * MB; // khớp MAX_PDF_SIZE của BE
const MAX_DOCX = 10 * MB; // khớp uploadDocument của BE
const MAX_IMAGE = 10 * MB;
export const MAX_CONTENT = 500000; // khớp DocumentRequest.content

// Nhận diện PDF / DOCX theo MIME hoặc đuôi file (một số máy gửi MIME rỗng)
const fileMime = (f: File): string | null => {
  const name = f.name.toLowerCase();
  if (f.type === PDF_MIME || name.endsWith(".pdf")) return PDF_MIME;
  if (f.type === DOCX_MIME || name.endsWith(".docx")) return DOCX_MIME;
  return null;
};

const toInput = (d: DocumentItem): DocumentInput => ({
  type: d.type,
  categoryId: d.category?.id ?? null,
  title: d.title,
  slug: d.slug,
  description: d.description ?? "",
  content: d.content ?? "",
  published: d.published,
  removeFile: false,
  removeThumbnail: false,
});

// Form tạo / sửa tài liệu: nạp dữ liệu, chọn file + thumbnail, kiểm tra, gửi lên BE
export function useAdminDocumentForm(editId: number | null) {
  const toast = useToast();
  const [form, setForm] = useState<DocumentInput>(EMPTY);
  const [initial, setInitial] = useState<DocumentInput>(EMPTY);
  const [saved, setSaved] = useState<DocumentItem | null>(null); // bản đang lưu ở BE (khi sửa)
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(editId !== null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminDocumentService
      .getCategories()
      .then((list) => setCategories(list.filter((c) => c.active !== false)))
      .catch(() => toast.show("Không tải được danh mục", "error"));
  }, [toast]);

  useEffect(() => {
    if (editId === null) return;
    let ignore = false;
    adminDocumentService
      .get(editId)
      .then((d) => {
        if (ignore) return;
        setSaved(d);
        setForm(toInput(d));
        setInitial(toInput(d));
      })
      .catch((err) => {
        if (ignore) return;
        toast.show(getErrorMessage(err), "error");
        setNotFound(true);
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [editId, toast]);

  // Xem trước thumbnail mới chọn; giải phóng URL tạm khi đổi ảnh / rời trang
  const thumbnailPreview = useMemo(() => (thumbnail ? URL.createObjectURL(thumbnail) : null), [thumbnail]);
  useEffect(() => () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

  const setField = <K extends keyof DocumentInput>(key: K, value: DocumentInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickFile = (f: File | null) => {
    if (!f) return;
    const mime = fileMime(f);
    if (!mime) {
      toast.show("Chỉ hỗ trợ file PDF hoặc DOCX", "error");
      return;
    }
    const max = mime === PDF_MIME ? MAX_PDF : MAX_DOCX;
    if (f.size > max) {
      toast.show(`File ${mime === PDF_MIME ? "PDF" : "DOCX"} tối đa ${max / MB}MB`, "error");
      return;
    }
    setFile(f);
    setField("removeFile", false);
  };

  const pickThumbnail = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > MAX_IMAGE) {
      toast.show(`Ảnh đại diện phải là file ảnh, tối đa ${MAX_IMAGE / MB}MB`, "error");
      return;
    }
    setThumbnail(f);
    setField("removeThumbnail", false);
  };

  // Bỏ file mới chọn; nếu không có file mới thì đánh dấu gỡ file đang lưu
  const clearFile = () => {
    if (file) setFile(null);
    else setField("removeFile", true);
  };

  const clearThumbnail = () => {
    if (thumbnail) setThumbnail(null);
    else setField("removeThumbnail", true);
  };

  const hasSavedFile = !!saved?.fileUrl && !form.removeFile;
  const currentThumbnail = thumbnailPreview ?? (form.removeThumbnail ? null : saved?.thumbnail ?? null);

  // Ảnh chèn trong bài viết: upload lên Cloudinary, trả URL cho editor
  const uploadContentImage = async (image: File): Promise<string | null> => {
    if (!image.type.startsWith("image/") || image.size > MAX_IMAGE) {
      toast.show(`Ảnh phải là file ảnh, tối đa ${MAX_IMAGE / MB}MB`, "error");
      return null;
    }
    try {
      return await adminDocumentService.uploadContentImage(image);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return null;
    }
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(initial) || !!file || !!thumbnail;

  // Trả true khi lưu thành công
  const submit = async (): Promise<boolean> => {
    const missing = [
      !form.title.trim() && "tiêu đề",
      form.type === "FILE" && !file && !hasSavedFile && "file PDF / DOCX",
      form.type === "ARTICLE" && isRichTextEmpty(form.content) && "nội dung bài viết",
    ].filter(Boolean);
    if (missing.length > 0) {
      toast.show(`Vui lòng bổ sung: ${missing.join(", ")}`, "error");
      return false;
    }

    // Bài viết không đính kèm file: không gửi file, gỡ luôn file cũ nếu có (vd đổi từ "Tải lên file" sang)
    const isArticle = form.type === "ARTICLE";
    const payload = isArticle ? { ...form, removeFile: true } : form;
    const upload = isArticle ? null : file;

    setSaving(true);
    try {
      if (editId === null) await adminDocumentService.add(payload, upload, thumbnail);
      else await adminDocumentService.edit(editId, payload, upload, thumbnail);
      toast.show(editId === null ? "Đã thêm tài liệu" : "Đã cập nhật tài liệu");
      return true;
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setField,
    saved,
    categories,
    loading,
    notFound,
    saving,
    dirty,
    file,
    pickFile,
    clearFile,
    hasSavedFile,
    currentThumbnail,
    pickThumbnail,
    clearThumbnail,
    uploadContentImage,
    submit,
  };
}
