import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "./urban/HavenHeader";
import SkylineFooter from "./urban/SkylineFooter";
import UrbanChatbot from "./urban/UrbanChatbot";
import FlowBackground from "./urban/FlowBackground";
import "./urban/chatbot.css";
import "./urban/background.css";
import UrbanHero from "./urban/UrbanHero";
import {
  SoftAdvantages, SoftAmenities, SoftDayInLife, SoftJourney, SoftManifesto, SoftProjects, SoftServices, SoftStats, SoftStory, SoftTestimonials,
} from "./soft/SoftSections";
import { S, SANS } from "./soft/softUi";

/* Trang chủ nháp phong cách mềm (/home-draft-4): cùng nội dung với home-draft-3 nhưng thiết kế nhẹ nhàng —
   tiêu đề serif Playfair chữ thường (phần nhấn in nghiêng tô xanh), nhãn nhỏ giãn chữ, thẻ kính bóng bo tròn, ảnh bo góc lớn,
   nút viên thuốc; banner video dùng chung với home-draft-3; nền kem có quầng nhạt và dải lụa mờ (dùng chung background.css), không có đường lượn mảnh. Header, chân trang, chatbot dùng chung với home-draft-3 */
export default function SoftDraftPage() {
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/home-draft-4`,
  });

  return (
    <div className="hd-page-bg relative min-h-svh overflow-x-clip" style={{ color: S.ink, fontFamily: SANS }}>
      <FlowBackground lines={false} />      <HavenHeader home="/home-draft-4" font={SANS} onDark />
      <UrbanHero />
      <SoftStats />
      <SoftAdvantages />
      <SoftManifesto />
      <SoftServices />
      <SoftProjects />
      <SoftDayInLife />
      <SoftStory />
      <SoftAmenities />
      <SoftJourney />
      <SoftTestimonials />
      <SkylineFooter />
      <UrbanChatbot />
    </div>
  );
}
