import ObjectiveBlock from "./blocks/ObjectiveBlock";
import SummaryBlock from "./blocks/SummaryBlock";
import AchievementsBlock from "./blocks/AchievementsBlock";
import ExperienceBlock from "./blocks/ExperienceBlock";
import ProjectsBlock from "./blocks/ProjectsBlock";
import EducationBlock from "./blocks/EducationBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import CertificatesBlock from "./blocks/CertificatesBlock";
import LanguagesBlock from "./blocks/LanguagesBlock";
import ReferencesBlock from "./blocks/ReferencesBlock";
import CustomBlock from "./blocks/CustomBlock";
import type { CvData, CvSectionKey } from "../../../types/job/cv.types";

/** Chọn khối nội dung theo khóa section. `dark` dùng cho cột trái màu chủ đạo của mẫu Modern. */
export default function SectionBody({
  sectionKey,
  data,
  timeline = false,
  dark = false,
}: {
  sectionKey: CvSectionKey;
  data: CvData;
  timeline?: boolean;
  dark?: boolean;
}) {
  if (sectionKey.startsWith("custom:"))
    return <CustomBlock data={data} id={sectionKey.slice(7)} />;

  switch (sectionKey) {
    case "summary":
      return <SummaryBlock data={data} />;
    case "objective":
      return <ObjectiveBlock data={data} />;
    case "achievements":
      return <AchievementsBlock data={data} />;
    case "experience":
      return <ExperienceBlock data={data} timeline={timeline} />;
    case "projects":
      return <ProjectsBlock data={data} />;
    case "education":
      return <EducationBlock data={data} dark={dark} />;
    case "skills":
      return <SkillsBlock data={data} dark={dark} />;
    case "certificates":
      return <CertificatesBlock data={data} dark={dark} />;
    case "languages":
      return <LanguagesBlock data={data} dark={dark} />;
    case "references":
      return <ReferencesBlock data={data} />;
    default:
      return null;
  }
}
