import useSyncForm from "../../../hooks/job/useSyncForm";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, textareaClass } from "./fields";
import { STEP_FORM_ID } from "./PersonalInfoForm";
import { objectiveSchema } from "../cvSchemas";
import { useCvBuilder } from "../cvBuilderContext";

const MAX = 600;

export default function ObjectiveForm({ onNext }: { onNext: () => void }) {
  const objective = useCvBuilder((s) => s.data.objective);
  const setSection = useCvBuilder((s) => s.setSection);

  const form = useForm<{ objective: string }>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: { objective },
    mode: "onChange",
  });
  useSyncForm(form, (v) => setSection("objective", v.objective ?? ""));

  const length =
    useWatch({ control: form.control, name: "objective" })?.length ?? 0;

  return (
    <form id={STEP_FORM_ID} noValidate onSubmit={form.handleSubmit(onNext)}>
      <Field
        label="Mục tiêu nghề nghiệp"
        required
        error={form.formState.errors.objective?.message}
      >
        <textarea
          {...form.register("objective")}
          rows={7}
          aria-invalid={!!form.formState.errors.objective}
          className={textareaClass}
          placeholder="Vd: Trở thành trưởng nhóm kinh doanh dự án hạng sang, đạt doanh số 60 tỷ/năm..."
        />
      </Field>
      <p
        className={`mt-1.5 text-right text-xs ${
          length > MAX ? "text-danger" : "text-muted"
        }`}
        aria-live="polite"
      >
        {length}/{MAX}
      </p>
    </form>
  );
}
