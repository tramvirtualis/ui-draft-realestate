import { useState } from "react";
import { Building2, ShieldCheck, UserRound } from "lucide-react";
import DocumentPicker from "./DocumentPicker";
import LogoPicker from "./LogoPicker";
import {
  COMPANY_PHONE_RULE,
  ID_CARD_RULE,
  TAX_CODE_RULE,
  WEBSITE_RULE,
  type Company,
  type CompanyFiles,
  type CompanyInput,
} from "../../types/job/company.types";
import { EMAIL_RULE } from "../../types/admin/adminUser.types";

type Props = {
  // Có company = đang sửa / gửi lại (file không bắt buộc)
  company: Company | null;
  submitLabel: string;
  // Cảnh báo phía trên nút gửi (vd đổi thông tin định danh sẽ phải duyệt lại)
  notice?: string;
  onSubmit: (input: CompanyInput, files: CompanyFiles) => Promise<void>;
  onCancel?: () => void;
};

type Errors = Partial<Record<keyof CompanyInput | keyof CompanyFiles, string>>;

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-heading outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-red-300";

const fromCompany = (c: Company | null): CompanyInput => ({
  name: c?.name ?? "",
  taxCode: c?.taxCode ?? "",
  address: c?.address ?? "",
  phone: c?.phone ?? "",
  email: c?.email ?? "",
  website: c?.website ?? "",
  description: c?.description ?? "",
  representativeName: c?.representativeName ?? "",
  representativePosition: c?.representativePosition ?? "",
  // Chủ hồ sơ chỉ nhận số CCCD đã che → để trống, bắt nhập lại khi sửa
  idCardNumber: "",
});

// Kiểm tra giống CompanyRequest bên BE để báo lỗi ngay trên form
function validate(
  v: CompanyInput,
  files: CompanyFiles,
  isNew: boolean
): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Vui lòng nhập tên công ty";
  if (!TAX_CODE_RULE.test(v.taxCode.trim()))
    e.taxCode = "Mã số thuế gồm 10 số (chi nhánh: 10 số-3 số)";
  if (!v.address.trim()) e.address = "Vui lòng nhập địa chỉ";
  if (!COMPANY_PHONE_RULE.test(v.phone.trim()))
    e.phone = "Số điện thoại không hợp lệ";
  if (!EMAIL_RULE.test(v.email.trim())) e.email = "Email không hợp lệ";
  if (v.website.trim() && !WEBSITE_RULE.test(v.website.trim()))
    e.website = "Website phải bắt đầu bằng http:// hoặc https://";
  if (!v.representativeName.trim())
    e.representativeName = "Vui lòng nhập họ tên người đại diện";
  if (!ID_CARD_RULE.test(v.idCardNumber.trim()))
    e.idCardNumber = "Số CCCD gồm 12 chữ số";
  if (isNew) {
    if (!files.businessLicense)
      e.businessLicense = "Vui lòng tải lên giấy chứng nhận đăng ký kinh doanh";
    if (!files.idCardFront)
      e.idCardFront = "Vui lòng tải lên ảnh CCCD mặt trước";
    if (!files.idCardBack) e.idCardBack = "Vui lòng tải lên ảnh CCCD mặt sau";
  }
  return e;
}

// Form đăng ký / sửa hồ sơ nhà tuyển dụng: thông tin công ty, người đại diện, giấy tờ
export default function CompanyForm({
  company,
  submitLabel,
  notice,
  onSubmit,
  onCancel,
}: Props) {
  const isNew = company === null;
  const [values, setValues] = useState<CompanyInput>(() =>
    fromCompany(company)
  );
  const [files, setFiles] = useState<CompanyFiles>({
    logo: null,
    businessLicense: null,
    idCardFront: null,
    idCardBack: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof CompanyInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    };
  const setFile = (key: keyof CompanyFiles) => (file: File | null) => {
    setFiles((f) => ({ ...f, [key]: file }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const found = validate(values, files, isNew);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Đưa người dùng tới ô lỗi đầu tiên
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values, files);
    } finally {
      setSaving(false);
    }
  };

  const input = (
    key: keyof CompanyInput,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <label className="block text-sm font-semibold text-heading">
      {label}
      {props.required && <span className="text-danger"> *</span>}
      <input
        value={values[key]}
        onChange={set(key)}
        aria-invalid={!!errors[key]}
        className={field}
        {...props}
        required={false}
      />
      {errors[key] && (
        <span className="mt-1 block text-xs font-normal text-danger">
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-heading">
          <Building2 size={18} className="text-primary-600" aria-hidden /> Thông
          tin công ty
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <LogoPicker
              companyName={values.name}
              currentUrl={company?.logoUrl}
              file={files.logo}
              onChange={setFile("logo")}
            />
          </div>
          <div className="md:col-span-2">
            {input("name", "Tên công ty", {
              required: true,
              maxLength: 255,
              placeholder: "Công ty TNHH ABC",
            })}
          </div>
          {input("taxCode", "Mã số thuế", {
            required: true,
            inputMode: "numeric",
            maxLength: 14,
            placeholder: "0312345678",
          })}
          {input("phone", "Số điện thoại liên hệ", {
            required: true,
            inputMode: "tel",
            maxLength: 11,
            placeholder: "0281234567",
          })}
          <div className="md:col-span-2">
            {input("address", "Địa chỉ", {
              required: true,
              maxLength: 255,
              placeholder: "Số nhà, đường, phường, quận, tỉnh/thành",
            })}
          </div>
          {input("email", "Email tuyển dụng", {
            required: true,
            type: "email",
            maxLength: 100,
            placeholder: "hr@congty.vn",
          })}
          {input("website", "Website", {
            type: "url",
            maxLength: 255,
            placeholder: "https://congty.vn",
          })}
          <label className="block text-sm font-semibold text-heading md:col-span-2">
            Giới thiệu công ty
            <textarea
              value={values.description}
              onChange={set("description")}
              rows={4}
              maxLength={5000}
              placeholder="Lĩnh vực hoạt động, quy mô, văn hóa làm việc..."
              className={field}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-heading">
          <UserRound size={18} className="text-primary-600" aria-hidden /> Người
          đại diện
        </h2>
        <p className="mt-1 text-xs text-body">
          Thông tin phải trùng khớp với CCCD tải lên bên dưới.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {input("representativeName", "Họ và tên", {
            required: true,
            maxLength: 100,
            placeholder: "Nguyễn Văn A",
          })}
          {input("representativePosition", "Chức vụ", {
            maxLength: 100,
            placeholder: "Giám đốc nhân sự",
          })}
          <div className="md:col-span-2">
            {input("idCardNumber", "Số CCCD", {
              required: true,
              inputMode: "numeric",
              maxLength: 12,
              autoComplete: "off",
              placeholder: company
                ? `Nhập lại số CCCD (hiện tại ${company.idCardNumber})`
                : "12 chữ số",
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-heading">
          <ShieldCheck size={18} className="text-primary-600" aria-hidden />{" "}
          Giấy tờ xác minh
        </h2>
        <p className="mt-1 text-xs text-body">
          Giấy tờ được lưu riêng tư, chỉ bạn và quản trị viên duyệt hồ sơ xem
          được.
        </p>
        <div className="mt-4 space-y-4">
          <DocumentPicker
            label="Giấy chứng nhận đăng ký kinh doanh"
            hint="Bản chụp rõ nét hoặc file PDF, thấy được tên công ty và mã số thuế"
            file={files.businessLicense}
            onChange={setFile("businessLicense")}
            hasExisting={!isNew}
            error={errors.businessLicense}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <DocumentPicker
              label="CCCD mặt trước"
              file={files.idCardFront}
              onChange={setFile("idCardFront")}
              hasExisting={!isNew}
              error={errors.idCardFront}
            />
            <DocumentPicker
              label="CCCD mặt sau"
              file={files.idCardBack}
              onChange={setFile("idCardBack")}
              hasExisting={!isNew}
              error={errors.idCardBack}
            />
          </div>
        </div>
      </section>

      {notice && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </p>
      )}

      <label className="flex items-start gap-2.5 text-sm text-body">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
        />
        Tôi cam kết thông tin và giấy tờ cung cấp là chính xác, và đồng ý để Đất
        Việt Group dùng chúng cho mục đích xác minh nhà tuyển dụng.
      </label>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-11 rounded-full border border-line px-6 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-60"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={!agreed || saving}
          className="h-11 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Đang gửi hồ sơ..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
