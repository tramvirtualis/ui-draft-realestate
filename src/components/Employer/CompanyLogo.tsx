import { useState } from "react";

// "Công ty TNHH ABC" → "AB" (2 chữ đầu của 2 từ cuối, bỏ qua tiền tố loại hình doanh nghiệp)
const PREFIX = /^(công ty|cty|tnhh|cổ phần|cp|jsc|co\.?,?|ltd\.?|mtv|một thành viên)\s+/i;
const initialsOfCompany = (name: string) => {
  let rest = name.trim();
  while (PREFIX.test(rest)) rest = rest.replace(PREFIX, "");
  const words = (rest || name).split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
};

/**
 Logo công ty (bo góc vuông để phân biệt với avatar tròn của người dùng).
 Chưa có logo / ảnh lỗi thì hiện chữ viết tắt tên công ty.
 */
export default function CompanyLogo({
  name,
  logoUrl,
  className = "h-12 w-12",
  textSize = "text-sm",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
  textSize?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (logoUrl && logoUrl !== failedUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        onError={() => setFailedUrl(logoUrl)}
        className={`${className} shrink-0 rounded-xl border border-line bg-white object-contain p-1`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} ${textSize} flex shrink-0 items-center justify-center rounded-xl bg-primary-100 font-bold text-primary-700`}
    >
      {initialsOfCompany(name)}
    </span>
  );
}
