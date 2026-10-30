import { useState } from "react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import type { ProjectOverview, NearbyItem } from "../../../../data/project/detail/overview";

type Props = { project: ProjectOverview; nearby: NearbyItem[] };

export default function LocationSection({ project: p, nearby }: Props) {
  const [mapMode, setMapMode] = useState("map");

  return (
    <section className="bg-primary-50/70 py-16">
      <Container>
        <SectionHeading
          id="vi-tri"
          eyebrow="Vị trí"
          title="Tâm điểm kết nối của đô thị Thủ Thiêm"
          desc="Từ Aurelia Riverside, cư dân kết nối Quận 1 trong 5 phút và tiếp cận nhanh mạng lưới metro, trường học, y tế, thương mại cao cấp."
        />
        <div className="grid gap-5 lg:grid-cols-[1fr_405px]">
          <div className="relative overflow-hidden border border-line bg-white" style={{ height: 480 }}>
            <iframe
              title="Bản đồ dự án"
              className="h-full w-full"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(p.location)}&output=embed`}
            />
            <div className="absolute right-4 top-4 flex rounded-full bg-white p-1 text-xs shadow">
              {[["map", "Bản đồ"], ["sat", "Vệ tinh"]].map(([k, l]) => (
                <button key={k} onClick={() => setMapMode(k)} className={`rounded-full px-4 py-1.5 font-medium ${mapMode === k ? "bg-primary-100 text-primary-600" : "text-body"}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-3 py-2 text-white shadow-lg">
              <p className="text-xs font-semibold">{p.name}</p>
              <p className="text-[10px] text-white/80">Thủ Thiêm · Ven sông</p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-primary-100/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-heading">Kết nối lân cận</h3>
              <a href="#vi-tri" className="text-sm font-medium text-primary-600">Mở chỉ đường</a>
            </div>
            <p className="mt-3 text-sm text-body">Khoảng cách ước tính theo tuyến đường di chuyển ngắn nhất.</p>
            <ul className="mt-5 space-y-3">
              {nearby.map(({ icon: Icon, name, distance }) => (
                <li key={name} className="flex items-center gap-3 rounded-xl bg-primary-50/70 px-3 py-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-600">
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-heading">{name}</span>
                  <span className="text-xs font-semibold text-primary-600">{distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
