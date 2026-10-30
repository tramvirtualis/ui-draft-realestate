import useSyncForm from "../../../hooks/job/useSyncForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { RhfField } from "./fields";
import { STEP_FORM_ID } from "./PersonalInfoForm";
import { customSectionSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";

/** Mục tùy chỉnh: tiêu đề và nội dung tự do. Trang cha đặt `key` theo id mục. */
export default function CustomSectionForm({
  sectionId,
  onNext,
  onRemoved,
}: {
  sectionId: string;
  onNext: () => void;
  onRemoved: () => void;
}) {
  const section = useCvBuilder((s) =>
    s.data.customSections.find((c) => c.id === sectionId)
  );
  const setSection = useCvBuilder((s) => s.setSection);
  const removeCustomSection = useCvBuilder((s) => s.removeCustomSection);

  const form = useForm<{ title: string; content: string }>({
    resolver: zodResolver(customSectionSchema),
    defaultValues: {
      title: section?.title ?? "",
      content: section?.content ?? "",
    },
    mode: "onChange",
  });

  useSyncForm(form, (v) =>
    setSection("customSections", (all) =>
      all.map((c) =>
        c.id === sectionId
          ? { ...c, title: v.title ?? "", content: v.content ?? "" }
          : c
      )
    )
  );

  return (
    <form
      id={STEP_FORM_ID}
      noValidate
      onSubmit={form.handleSubmit(onNext)}
      className="space-y-4"
    >
      <RhfField
        form={form}
        name="title"
        label="Tiêu đề mục"
        required
        placeholder="Giải thưởng"
      />
      <RhfField
        form={form}
        name="content"
        label="Nội dung"
        required
        textarea
        rows={8}
        placeholder="Top 1 doanh số quý 3/2025 – Masterise Homes"
      />
      <button
        type="button"
        onClick={() => {
          removeCustomSection(sectionId);
          onRemoved();
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-danger hover:underline"
      >
        <Trash2 size={14} aria-hidden /> Xóa mục này
      </button>
    </form>
  );
}
