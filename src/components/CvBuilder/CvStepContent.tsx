import type { ReactNode } from "react";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import ObjectiveForm from "./forms/ObjectiveForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import ProjectsForm from "./forms/ProjectsForm";
import CertificatesForm from "./forms/CertificatesForm";
import LanguagesForm from "./forms/LanguagesForm";
import ReferencesForm from "./forms/ReferencesForm";
import CustomSectionForm from "./forms/CustomSectionForm";
import type { CvStepId } from "../../types/job/cv.types";

type FormProps = { onNext: () => void };

const STEP_FORMS: Record<CvStepId, (p: FormProps) => ReactNode> = {
  personal: (p) => <PersonalInfoForm {...p} />,
  objective: (p) => <ObjectiveForm {...p} />,
  experience: (p) => <ExperienceForm {...p} />,
  education: (p) => <EducationForm {...p} />,
  skills: (p) => <SkillsForm {...p} />,
  projects: (p) => <ProjectsForm {...p} />,
  certificates: (p) => <CertificatesForm {...p} />,
  languages: (p) => <LanguagesForm {...p} />,
  references: (p) => <ReferencesForm {...p} />,
};

/** Chọn form theo bước: 9 bước cố định hoặc một mục tùy chỉnh (`custom:<id>`) */
export default function CvStepContent({
  step,
  customId,
  onNext,
  onCustomRemoved,
}: {
  step?: CvStepId;
  customId?: string;
  onNext: () => void;
  onCustomRemoved: () => void;
}) {
  if (step) return <>{STEP_FORMS[step]({ onNext })}</>;
  if (customId) {
    return (
      <CustomSectionForm
        key={customId}
        sectionId={customId}
        onNext={onNext}
        onRemoved={onCustomRemoved}
      />
    );
  }
  return null;
}
