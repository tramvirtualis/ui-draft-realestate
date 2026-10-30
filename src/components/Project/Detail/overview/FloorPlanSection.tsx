import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, ArrowRight, SlidersHorizontal } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import { outlineBtn } from "../styles";
import type { PinItem, BuildingItem, FacilityItem, PropertyRow } from "../../../../data/project/detail/overview";

const STATUS_STYLE: Record<string, string> = {
  "Còn hàng": "bg-success/10 text-success",
  "Giữ chỗ": "bg-warning/10 text-warning",
  "Sắp mở": "bg-primary-100 text-primary-700",
};

type Props = {
  projectId?: string;
  pins: PinItem[];
  buildings: BuildingItem[];
  facilities: FacilityItem[];
  properties: PropertyRow[];
};

export default function FloorPlanSection({ projectId, pins, buildings, facilities, properties }: Props) {
  const [buildingFilter, setBuildingFilter] = useState("Tất cả");

  return (
    <section className="bg-primary-50/70 py-16">
      <Container>
        <SectionHeading
          id="mat-bang"
          eyebrow="Mặt bằng & quỹ căn"
          title="Chọn đúng tòa, đúng tầng, đúng tầm nhìn"
          desc="Khám phá mặt bằng tổng thể và tình trạng sản phẩm cập nhật gần thời gian thực. Chọn điểm trên sơ đồ để xem nhanh quỹ căn tương ứng."
          action={
            <div className="flex items-center gap-4 rounded-full border border-line bg-white px-4 py-2.5 text-xs text-body">
              {[["bg-success", "Còn hàng"], ["bg-warning", "Sắp mở bán"], ["bg-danger", "Đã bán"]].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${c}`} /> {l}
                </span>
              ))}
            </div>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="relative overflow-hidden border border-line" style={{ height: 600 }}>
            <img src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1400&q=80" alt="Mặt bằng tổng thể" className="h-full w-full object-cover" />
            <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-4 py-2.5 shadow">
              <p className="text-sm font-semibold text-heading">Mặt bằng tổng thể</p>
              <p className="text-[11px] text-body">Hướng Bắc ↑ · Sông Sài Gòn phía Đông</p>
            </div>
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              {[Plus, Minus].map((Icon, k) => (
                <button key={k} aria-label={k ? "Thu nhỏ" : "Phóng to"} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow">
                  <Icon size={16} />
                </button>
              ))}
            </div>
            {pins.map((pin) => (
              <span
                key={pin.code}
                style={{ left: pin.left, top: pin.top }}
                className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-xs font-bold text-white shadow-lg ${pin.color}`}
              >
                {pin.code}
              </span>
            ))}
          </div>

          <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-heading">Tòa nhà & sản phẩm</h3>
              <span className="text-sm font-medium text-primary-600">126 căn phù hợp</span>
            </div>
            <div className="mt-4 flex gap-2">
              {["Tất cả", "Căn hộ", "Thấp tầng"].map((f) => (
                <button key={f} onClick={() => setBuildingFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${buildingFilter === f ? "bg-primary-100 text-primary-600" : "text-heading"}`}>
                  {f}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-3">
              {buildings.map((b) => (
                <li key={b.code} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${b.active ? "border-primary-300 bg-primary-50" : "border-transparent bg-primary-50/60"}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${b.active ? "bg-primary-600 text-white" : "bg-white text-heading"}`}>{b.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-heading">{b.name}</span>
                    <span className="block truncate text-[11px] text-body">{b.note}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-primary-600">{b.meta}</span>
                </li>
              ))}
            </ul>
            <Link to={`/projects/${projectId}/floor-plans`} className="mt-4 flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 py-3 text-sm font-medium text-heading">
              Xem quỹ căn theo tòa <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {facilities.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Icon size={17} />
              </span>
              <span>
                <span className="block text-xs text-body">{label}</span>
                <span className="block text-sm font-semibold text-heading">{value}</span>
              </span>
            </div>
          ))}
        </div>

        <div id="quy-can" className="mt-6 scroll-mt-36 rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-heading">Quỹ căn đang quan tâm</h3>
              <p className="mt-1 text-xs text-body">Dữ liệu mẫu · Cập nhật lúc 09:45 hôm nay</p>
            </div>
            <button className={outlineBtn}>
              Bộ lọc <SlidersHorizontal size={15} />
            </button>
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-primary-50/70 text-xs text-body">
                <tr>
                  {["Mã căn", "Tòa", "Tầng", "Diện tích", "Loại hình", "Hướng", "Giá tham khảo", "Trạng thái"].map((h) => (
                    <th key={h} className="px-4 py-3.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((r) => (
                  <tr key={r.code} className="border-t border-line text-body">
                    <td className="px-4 py-4 font-semibold text-heading">{r.code}</td>
                    <td className="px-4 py-4">{r.zone}</td>
                    <td className="px-4 py-4">{r.floor}</td>
                    <td className="px-4 py-4">{r.area}</td>
                    <td className="px-4 py-4">{r.type}</td>
                    <td className="px-4 py-4">{r.direction}</td>
                    <td className="px-4 py-4 font-medium text-primary-600">{r.price}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[r.status] ?? "bg-primary-100 text-primary-700"}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
            <span>* Giá đã bao gồm VAT, chưa bao gồm phí bảo trì. Tình trạng có thể thay đổi theo thời gian thực.</span>
            <Link to={`/projects/${projectId}/inventory`} className="flex items-center gap-1 text-xs font-semibold text-primary-600">
              Xem toàn bộ 126 căn <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
