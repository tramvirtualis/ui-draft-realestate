import SectionBody from "./SectionBody";
import EditText, { useCvEdit } from "./EditText";
import type { CvTemplateProps } from "./templateProps";
import { formatDay, isSectionEmpty, sectionTitle } from "../cvHelpers";

//Khung một cột dùng cho hai mẫu Professional và Minimal
export default function CvSingleColumn({
  data,
  style,
  variant,
}: CvTemplateProps & { variant: "professional" | "minimal" }) {
  const p = data.personal;
  const pro = variant === "professional";
  const visible = style.sectionOrder.filter((k) => !isSectionEmpty(k, data));
  const edit = useCvEdit();
  // field = null: giá trị đã định dạng (ngày sinh), sửa ở form
  const contacts = [
    { text: p.phone, field: "phone" as const },
    { text: p.email, field: "email" as const },
    { text: p.address, field: "address" as const },
    { text: formatDay(p.birthDate), field: null },
    { text: p.linkedin, field: "linkedin" as const },
    { text: p.zalo, field: "zalo" as const },
  ].filter((c) => c.text);

  return (
    <div className="bg-white text-gray-800">
      {pro && <div className="h-3" style={{ background: "var(--cv-color)" }} />}
      <div className="box-decoration-clone px-10 py-8">
        <header
          className={`flex items-center gap-5 ${
            pro ? "" : "border-b border-gray-200 pb-5"
          }`}
        >
          {p.avatarUrl && (
            <img
              src={p.avatarUrl}
              alt={p.fullName}
              className={`h-20 w-20 shrink-0 object-cover ${
                pro ? "rounded-md" : "rounded-full"
              }`}
            />
          )}
          <div className="min-w-0">
            <p
              className={`text-[2em] leading-tight ${
                pro ? "font-bold uppercase" : "font-light tracking-wide"
              }`}
              style={{ color: "var(--cv-color)" }}
            >
              <EditText
                value={p.fullName}
                onCommit={edit?.personal("fullName")}
                placeholder="Họ và tên"
              />
            </p>
            <EditText
              as="p"
              className="block text-[1em] text-gray-600"
              value={p.title}
              onCommit={edit?.personal("title")}
              placeholder="Chức danh"
            />
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.82em] text-gray-600">
              {contacts.map((c) => (
                <EditText
                  key={c.text}
                  value={c.text}
                  onCommit={c.field && edit?.personal(c.field)}
                />
              ))}
            </p>
          </div>
        </header>

        <div className="mt-5 space-y-5">
          {visible.map((k) => (
            <section key={k}>
              <h2
                className={
                  pro
                    ? "border-b-2 pb-1 text-[1em] font-bold uppercase tracking-wider"
                    : "text-[0.8em] font-semibold uppercase tracking-[0.2em]"
                }
                style={{
                  color: "var(--cv-color)",
                  borderColor: "var(--cv-color)",
                }}
              >
                {sectionTitle(k, data)}
              </h2>
              <div className="mt-2">
                <SectionBody
                  sectionKey={k}
                  data={data}
                  timeline={pro && k === "experience"}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
