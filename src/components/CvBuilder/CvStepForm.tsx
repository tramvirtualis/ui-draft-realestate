import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { STEP_FORM_ID } from "./forms/PersonalInfoForm";

/** Khung chung cho mọi bước: nhãn bước, tiêu đề, mô tả, nội dung form, nút lưu */
export default function CvStepForm({
  stepLabel,
  title,
  description,
  isLast,
  onSaveDraft,
  children,
}: {
  stepLabel: string;
  title: string;
  description: string;
  isLast: boolean;
  onSaveDraft: () => void;
  children: ReactNode;
}) {
  const [help, setHelp] = useState(false);

  return (
    <section
      className="flex flex-col rounded-3xl border border-line bg-white shadow-sm"
      aria-labelledby="cv-step-title"
    >
      <div className="p-5 pb-0 md:p-6 md:pb-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">
              {stepLabel}
            </p>
            <h2
              id="cv-step-title"
              className="mt-1 text-xl font-medium text-heading"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setHelp((v) => !v)}
            aria-expanded={help}
            aria-label="Trợ giúp"
            className="rounded-full bg-primary-50 p-2 text-primary-600 hover:bg-primary-100"
          >
            <HelpCircle size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-body">{description}</p>
        {help && (
          <p className="mt-3 rounded-xl bg-primary-50 p-3 text-xs text-body">
            Điền các trường có dấu <span className="text-danger">*</span> để
            hoàn thành mục. CV bên phải cập nhật ngay khi bạn nhập, và bản nháp
            được tự động lưu.
          </p>
        )}
      </div>

      <div className="p-5 md:p-6">{children}</div>

      <div className="sticky bottom-0 z-20 mt-auto grid grid-cols-2 gap-3 rounded-b-3xl border-t border-line bg-white p-4 md:px-6 lg:static">
        <button
          type="button"
          onClick={onSaveDraft}
          className="h-11 rounded-full border border-line text-sm font-medium text-heading transition hover:bg-primary-50"
        >
          Lưu bản nháp
        </button>
        <button
          type="submit"
          form={STEP_FORM_ID}
          className="h-11 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          {isLast ? "Hoàn tất" : "Lưu & tiếp tục →"}
        </button>
      </div>
    </section>
  );
}
