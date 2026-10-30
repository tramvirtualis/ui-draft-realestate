import {
  DEFAULT_CV_STYLE,
  type CvData,
  type CvStyle,
} from "../types/job/cv.types";

// CV mẫu đầy đủ các section, dùng để xem trước mẫu CV ở trang quản trị
export const SAMPLE_CV_DATA: CvData = {
  personal: {
    avatarUrl: "",
    fullName: "Nguyễn Minh Anh",
    title: "Chuyên viên kinh doanh bất động sản",
    phone: "0912 345 678",
    email: "minhanh@example.com",
    birthDate: "1995-08-18",
    address: "Cầu Giấy, Hà Nội",
    linkedin: "linkedin.com/in/minhanh",
    zalo: "0912345678",
    summary:
      "6 năm kinh nghiệm môi giới căn hộ và nhà phố tại Hà Nội, tư vấn hơn 200 giao dịch thành công. Thế mạnh: nắm chắc pháp lý dự án, chăm sóc khách hàng tận tâm, chốt giao dịch nhanh.",
  },
  objective:
    "Trở thành trưởng nhóm kinh doanh trong 2 năm tới, mang lại doanh số ổn định và trải nghiệm tư vấn tận tâm cho khách hàng mua nhà lần đầu.",
  experience: [
    {
      id: "e1",
      company: "Công ty CP Đất Việt Group",
      position: "Chuyên viên kinh doanh",
      startDate: "2022-03",
      endDate: "",
      current: true,
      bullets:
        "Tư vấn và chốt 45 căn hộ dự án Đất Việt Riverside\nXây dựng tệp 300+ khách hàng tiềm năng qua sự kiện mở bán\nĐạt danh hiệu nhân viên xuất sắc quý 2/2024",
      revenueBillion: 120,
      projectCount: 3,
      closeRate: 28,
    },
    {
      id: "e2",
      company: "Sàn giao dịch BĐS An Phát",
      position: "Nhân viên môi giới",
      startDate: "2019-07",
      endDate: "2022-02",
      current: false,
      bullets:
        "Môi giới nhà phố, đất nền khu vực phía Tây Hà Nội\nPhối hợp marketing chạy quảng cáo, tăng 40% lượng khách hỏi",
      revenueBillion: 35,
      projectCount: 2,
      closeRate: 20,
    },
  ],
  education: [
    {
      id: "ed1",
      school: "Đại học Kinh tế Quốc dân",
      major: "Quản trị kinh doanh",
      startDate: "2013-09",
      endDate: "2017-06",
      current: false,
    },
  ],
  skills: [
    { id: "s1", name: "Tư vấn & đàm phán", level: 90 },
    { id: "s2", name: "Phân tích pháp lý dự án", level: 75 },
    { id: "s3", name: "Chăm sóc khách hàng", level: 85 },
  ],
  projects: [
    {
      id: "p1",
      name: "Đất Việt Riverside",
      role: "Trưởng nhóm bán hàng",
      startDate: "2023-01",
      endDate: "2024-06",
      current: false,
      description: "Phân phối 200 căn hộ cao cấp, hoàn thành 110% chỉ tiêu.",
    },
  ],
  certificates: [
    {
      id: "c1",
      name: "Chứng chỉ hành nghề môi giới BĐS",
      issuer: "Bộ Xây dựng",
      year: "2020",
    },
  ],
  languages: [{ id: "l1", name: "Tiếng Anh", level: "IELTS 6.5" }],
  references: [
    {
      id: "r1",
      name: "Trần Văn Bình",
      position: "Giám đốc kinh doanh",
      company: "Đất Việt Group",
      phone: "0987 654 321",
      email: "binh.tv@example.com",
    },
  ],
  customSections: [
    {
      id: "x1",
      title: "Hoạt động",
      content:
        "Tình nguyện viên dự án Mái ấm cho người nghèo 2023\nThành viên CLB Bất động sản trẻ Hà Nội",
    },
  ],
};

// CV dài (khoảng 2 trang) để admin xem mẫu tự sang trang mới khi nội dung dài
export const SAMPLE_CV_DATA_LONG: CvData = {
  ...SAMPLE_CV_DATA,
  experience: [1, 2, 3].flatMap((n) =>
    SAMPLE_CV_DATA.experience.map((e) => ({ ...e, id: `${e.id}-${n}` }))
  ),
  projects: ["Đất Việt Riverside", "Đất Việt Lakeview", "Đất Việt Garden"].map(
    (name, i) => ({
      ...SAMPLE_CV_DATA.projects[0],
      id: `p${i + 1}`,
      name,
    })
  ),
};

// Có cả mục tùy chỉnh để admin thấy vị trí của "Mục tùy chỉnh" trong mẫu
export const SAMPLE_CV_STYLE: CvStyle = {
  ...DEFAULT_CV_STYLE,
  sectionOrder: [...DEFAULT_CV_STYLE.sectionOrder, "custom:x1"],
};
