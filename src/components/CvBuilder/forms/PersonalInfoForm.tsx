import { useState } from "react";
import useSyncForm from "../../../hooks/job/useSyncForm";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Info } from "lucide-react";
import AvatarUploader from "../AvatarUploader";
import { Field, RhfField, StatusBadge, textareaClass } from "./fields";
import { SUMMARY_MAX, personalSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";
import type { PersonalInfo } from "../../../types/job/cv.types";

export const STEP_FORM_ID = "cv-step-form";

const SUGGESTIONS = [
  "Chuyên viên kinh doanh BĐS có hơn 5 năm kinh nghiệm tư vấn, xây dựng tệp khách hàng và chốt giao dịch căn hộ, nhà phố tại TP.HCM.",
  "Hướng tới vị trí trưởng nhóm kinh doanh, mang đến doanh số bền vững nhờ quy trình chăm sóc khách hàng bài bản.",
  "Am hiểu pháp lý, thị trường và sản phẩm dự án cao cấp; đã đạt top 3 doanh số của sàn trong 4 quý liên tiếp.",
];

export default function PersonalInfoForm({ onNext }: { onNext: () => void }) {
  const personal = useCvBuilder((s) => s.data.personal);
  const setSection = useCvBuilder((s) => s.setSection);
  const [showTips, setShowTips] = useState(false);

  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalSchema),
    defaultValues: personal,
    mode: "onChange",
  });
  useSyncForm(form, (v) => setSection("personal", v));

  const { setValue, formState } = form;
  const values = useWatch({ control: form.control }) as PersonalInfo;
  const summaryLength = values.summary?.length ?? 0;

  const nameValid =
    !formState.errors.fullName && values.fullName.trim().length >= 2;

  return (
    <form
      id={STEP_FORM_ID}
      noValidate
      onSubmit={form.handleSubmit(onNext)}
      className="space-y-4"
    >
      <AvatarUploader
        value={values.avatarUrl}
        name={values.fullName}
        onChange={(url) => setValue("avatarUrl", url, { shouldDirty: true })}
      />

      <RhfField
        form={form}
        name="fullName"
        label="Họ và tên"
        required
        placeholder="Nguyễn Minh Anh"
        badge={nameValid ? <StatusBadge>Hợp lệ</StatusBadge> : null}
      />
      <RhfField
        form={form}
        name="title"
        label="Chức danh mong muốn"
        required
        placeholder="Chuyên viên kinh doanh bất động sản"
      />
      <RhfField
        form={form}
        name="phone"
        label="Số điện thoại"
        required
        type="tel"
        placeholder="090 346 8899"
      />
      <RhfField
        form={form}
        name="email"
        label="Email"
        required
        type="email"
        placeholder="ten@email.com"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <RhfField form={form} name="birthDate" label="Ngày sinh" type="date" />
        <RhfField
          form={form}
          name="address"
          label="Địa chỉ"
          placeholder="TP. Thủ Đức, TP.HCM"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-heading">
          Liên kết nghề nghiệp{" "}
          <span className="ml-2 text-xs font-normal text-muted">
            Không bắt buộc
          </span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <RhfField
            form={form}
            name="linkedin"
            label="LinkedIn"
            placeholder="linkedin.com/in/minhanh"
          />
          <RhfField
            form={form}
            name="zalo"
            label="Zalo"
            placeholder="zalo.me/0903468899"
          />
        </div>
      </fieldset>

      <div>
        <Field label="Giới thiệu bản thân" error={formState.errors.summary?.message}>
          <textarea
            {...form.register("summary")}
            rows={4}
            aria-invalid={!!formState.errors.summary}
            className={textareaClass}
            placeholder="Giới thiệu ngắn về kinh nghiệm và thế mạnh của bạn"
          />
        </Field>
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowTips((v) => !v)}
            aria-expanded={showTips}
            className="flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700"
          >
            <Lightbulb size={13} aria-hidden /> Gợi ý viết nổi bật hơn
          </button>
          <span
            className={
              summaryLength > SUMMARY_MAX ? "text-danger" : "text-muted"
            }
            aria-live="polite"
          >
            {summaryLength}/{SUMMARY_MAX}
          </span>
        </div>
        {showTips && (
          <ul className="mt-2 space-y-2 rounded-xl border border-primary-100 bg-primary-50/60 p-3">
            {SUGGESTIONS.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => {
                    setValue("summary", t.slice(0, SUMMARY_MAX), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setShowTips(false);
                  }}
                  className="text-left text-xs text-body hover:text-primary-700"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-xs text-success">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
        Thông tin liên hệ chỉ được chia sẻ trong CV bạn xuất hoặc gửi ứng tuyển.
      </p>
    </form>
  );
}
