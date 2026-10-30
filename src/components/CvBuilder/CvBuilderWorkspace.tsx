import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import Breadcrumb from "../common/Breadcrumb";
import useMediaQuery from "../common/useMediaQuery";
import { useToast } from "../common/toastContext";
import CvSectionNav from "./CvSectionNav";
import CvStepForm from "./CvStepForm";
import CvStepContent from "./CvStepContent";
import CvPreviewPanel from "./CvPreviewPanel";
import CvPreviewModal from "./CvPreviewModal";
import CvStylePanel from "./CvStylePanel";
import { useCvBuilder } from "./cvBuilderContext";
import { CV_STEPS, uid } from "../../types/job/cv.types";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const CLOUD_TEXT = {
  off: " · trên trình duyệt này (đăng nhập để mở được ở máy khác)",
  syncing: " · đang đồng bộ với tài khoản…",
  synced: " · đã đồng bộ với tài khoản",
  error: " · chưa đồng bộ được lên tài khoản, sẽ thử lại",
} as const;

/** Bố cục: danh sách mục | form theo bước | xem trước | mẫu & phong cách (sidebar phải từ xl). Bước hiện tại nằm trên URL (?buoc=). */
export default function CvBuilderWorkspace() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Màn rộng: tách "Mẫu & phong cách" ra sidebar phải cho gọn cột xem trước
  const isWide = useMediaQuery("(min-width: 1280px)");
  const [previewOpen, setPreviewOpen] = useState(false);
  const expandTemplates = params.get("focus") === "templates";

  const customSections = useCvBuilder((s) => s.data.customSections);
  const dirty = useCvBuilder((s) => s.dirty);
  const savedAt = useCvBuilder((s) => s.savedAt);
  const cloud = useCvBuilder((s) => s.cloud);
  const save = useCvBuilder((s) => s.save);
  const addCustomSection = useCvBuilder((s) => s.addCustomSection);
  const editRev = useCvBuilder((s) => s.editRev);

  const order = [
    ...CV_STEPS.map((s) => s.id as string),
    ...customSections.map((c) => `custom:${c.id}`),
  ];
  const requested = params.get("buoc") ?? "personal";
  const activeId = order.includes(requested) ? requested : "personal";
  const index = order.indexOf(activeId);

  const goTo = (id: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("buoc", id);
        return next;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = () => {
    if (save()) toast.show("Đã lưu bản nháp");
    else toast.show("Không thể lưu bản nháp trên trình duyệt này", "error");
  };

  const handleNext = () => {
    save();
    if (index < order.length - 1) goTo(order[index + 1]);
    else toast.show("Đã hoàn tất! CV của bạn sẵn sàng để tải PDF");
  };

  const handleAddCustom = () => {
    const id = uid();
    addCustomSection(id);
    goTo(`custom:${id}`);
  };

  const step = CV_STEPS.find((s) => s.id === activeId);
  const custom = customSections.find((c) => `custom:${c.id}` === activeId);

  return (
    <div className="container mx-auto px-4 pb-10 pt-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb
          items={[{ label: "Tuyển dụng", to: "/jobs" }, { label: "Tạo CV" }]}
        />
        <p className="text-xs text-muted" aria-live="polite">
          {dirty
            ? "Đang lưu…"
            : savedAt
            ? `Đã lưu lúc ${formatTime(savedAt)}`
            : ""}
          {!dirty && (savedAt || cloud !== "off") && (
            <span className={cloud === "error" ? "text-danger" : undefined}>
              {CLOUD_TEXT[cloud]}
            </span>
          )}
        </p>
      </div>

      <h1 className="sr-only">Tạo CV bất động sản</h1>

      <div className="mt-4 grid grid-cols-1 items-start gap-5 lg:grid-cols-2 xl:grid-cols-[220px_minmax(320px,0.8fr)_minmax(0,1.3fr)_300px]">
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <CvSectionNav
            activeId={activeId}
            onSelect={goTo}
            onAddCustom={handleAddCustom}
          />
        </div>

        <div className="min-w-0">
          {!isDesktop && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary-300 bg-white text-sm font-medium text-primary-600"
            >
              <Eye size={16} aria-hidden /> Xem CV
            </button>
          )}
          <CvStepForm
            // sửa trên preview thì nạp lại form với dữ liệu mới
            key={`${activeId}:${editRev}`}
            stepLabel={`BƯỚC ${index + 1} / ${order.length}`}
            title={step?.title ?? custom?.title ?? "Mục tùy chỉnh"}
            description={
              step?.description ??
              "Mục tự do: đặt tiêu đề và nội dung riêng cho CV của bạn."
            }
            isLast={index === order.length - 1}
            onSaveDraft={handleSaveDraft}
          >
            <CvStepContent
              step={step?.id}
              customId={custom?.id}
              onNext={handleNext}
              onCustomRemoved={() => goTo("personal")}
            />
          </CvStepForm>
        </div>

        {isDesktop && (
          <CvPreviewPanel
            expandTemplates={expandTemplates}
            showStyle={!isWide}
          />
        )}

        {isWide && (
          <aside
            className="sticky top-4 min-w-0 max-h-[calc(100vh-2rem)] overflow-y-auto"
            aria-label="Mẫu và phong cách"
          >
            <CvStylePanel expandTemplates={expandTemplates} />
          </aside>
        )}
      </div>

      {!isDesktop && previewOpen && (
        <CvPreviewModal onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
