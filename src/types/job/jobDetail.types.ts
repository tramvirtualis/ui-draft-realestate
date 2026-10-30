/** Dữ liệu hiển thị của trang chi tiết việc làm: các chuỗi đã được định dạng sẵn từ Job */

export interface JobDetailSection {
  heading: string;
  items: string[];
}

export interface JobDetailData {
  id: number;
  title: string;
  jobTypeName: string;
  employmentTypeLabel: string;
  levelLabel: string;
  statusLabel: string;
  isOpen: boolean;
  department: string;
  publishedText: string; 
  updatedText: string; 
  salaryText: string;
  location: string;
  experience: string;
  quantity: string;
  deadlineDate: string;
  daysLeftText: string; 
  progressPercent: number; 
  sections: JobDetailSection[];
}

//Thông tin liên hệ điền sẵn trong modal ứng tuyển 
export interface ApplicantInfo {
  fullName: string;
  email: string;
  phone: string;
}

// Khớp ApplicationRequest (gửi kèm cvId hoặc file cvFile)
export interface ApplicationRequest extends ApplicantInfo {
  coverLetter?: string;
  cvId?: number;
}
