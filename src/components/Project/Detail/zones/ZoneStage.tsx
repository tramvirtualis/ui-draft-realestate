import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import { statusTone } from "./zoneStatus";
import type { Zone, ZoneProject } from "../../../../types/project/zone.types";

type Props = {
  base: string;
  project: ZoneProject;
  zone: Zone;
  index: number;
  total: number;
  onStep: (dir: 1 | -1) => void;
};

// Khối chi tiết phân khu đang chọn (không có route chi tiết riêng nên hiển thị ngay trên trang)
export default function ZoneStage({ base, project, zone, index, total, onStep }: Props) {
  const tone = statusTone(zone.status);

  return (
    <div key={zone.id} className="animate-page-in grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <div className="relative overflow-hidden">
        <SafeImage
          src={zone.imageUrl ?? undefined}
          alt={zone.name}
          className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
        />
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-semibold text-primary-700 backdrop-blur">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Phân khu đang xem</p>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-heading md:text-5xl">{zone.name}</h2>

        {zone.status && (
          <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${tone.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {zone.status}
          </span>
        )}

        {zone.description && <p className="mt-5 leading-relaxed text-body">{zone.description}</p>}

        <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-body">Thuộc dự án</dt>
            <dd className="text-right font-semibold text-heading">{project.name}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-body">Vị trí</dt>
            <dd className="flex items-center gap-1 text-right font-semibold text-heading"><MapPin size={13} /> {project.location}</dd>
          </div>
          {zone.propertyCount !== null && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-body">Số bất động sản</dt>
              <dd className="font-semibold text-heading">{zone.propertyCount.toLocaleString("vi-VN")}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={`${base}/inventory`}
            className="group inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95"
          >
            Xem quỹ căn <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            to={base}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-3.5 text-sm font-medium text-heading transition hover:border-primary-300 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <ArrowLeft size={16} className="transition group-hover:-translate-x-1" /> Về dự án
          </Link>

          {total > 1 && (
            <div className="ml-auto flex gap-2">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => onStep(d)}
                  aria-label={d < 0 ? "Phân khu trước" : "Phân khu sau"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition hover:bg-primary-600 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95"
                >
                  {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
