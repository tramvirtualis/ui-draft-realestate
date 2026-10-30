import RecruitmentHero from "../../components/Recruitment/RecruitmentHero";
import JobListSection from "../../components/Recruitment/JobListSection";
import CvBuilderBanner from "../../components/Recruitment/CvBuilderBanner";
import useJobFilterParams from "../../hooks/job/useJobFilterParams";

const TITLE = "Tuyển dụng bất động sản | Đất Việt Group";
const DESCRIPTION =
  "Tìm việc làm bất động sản phù hợp năng lực: chuyên viên kinh doanh, quản lý dự án, giám đốc sàn và nhiều vị trí khác.";

export default function RecruitmentPage() {
  const { filter, setFilter } = useJobFilterParams();

  return (
    <>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />

      <RecruitmentHero filter={filter} onSearch={setFilter} />
      <JobListSection />
      <CvBuilderBanner />
    </>
  );
}
