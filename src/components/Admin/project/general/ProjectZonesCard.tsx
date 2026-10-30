import SafeImage from "../../../common/SafeImage";
import { statusTone } from "../../../Project/Detail/zones/zoneStatus";
import type { AdminProject } from "../../../../types/project/adminProject.types";

export default function ProjectZonesCard({ project: p }: { project: AdminProject }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-footer">Thông tin phân khu <span className="text-sm font-normal text-body">({p.zones.length})</span></h2>

      {p.zones.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/50 px-4 py-8 text-center text-sm text-body">Dự án chưa có phân khu nào.</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {p.zones.map((z, i) => (
            <div key={z.id} className="rounded-xl bg-primary-50/50 p-3">
              <SafeImage src={z.imageUrl ?? undefined} alt={z.name} className="h-[72px] w-full rounded-lg object-cover md:h-24" />
              <p className="mt-2 text-xs text-muted">Phân khu {i + 1}</p>
              <p className="text-sm font-semibold text-footer">{z.name}</p>
              {z.status && <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(z.status).badge}`}>{z.status}</span>}
              {z.description && <p className="mt-2 line-clamp-2 text-xs text-body">{z.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
