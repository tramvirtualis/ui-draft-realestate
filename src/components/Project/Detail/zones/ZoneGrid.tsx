import { ArrowUpRight } from "lucide-react";
import Reveal from "../../../common/Reveal";
import SafeImage from "../../../common/SafeImage";
import { statusTone } from "./zoneStatus";
import type { Zone } from "../../../../types/project/zone.types";

type Props = {
  zones: Zone[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export default function ZoneGrid({ zones, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {zones.map((z, i) => {
        const tone = statusTone(z.status);
        const active = z.id === selectedId;
        return (
          <Reveal key={z.id} delay={(i % 3) * 100} variant="clip" className="h-[380px] md:h-[420px]">
            <button
              onClick={() => onSelect(z.id)}
              aria-pressed={active}
              aria-label={`Xem phân khu ${z.name}`}
              className={`group relative block h-full w-full overflow-hidden text-left text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                active ? "ring-4 ring-primary-500 ring-offset-2" : ""
              }`}
            >
              <SafeImage src={z.imageUrl ?? undefined} alt="" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-footer/90 via-footer/25 to-transparent transition duration-500 group-hover:from-primary-700/95 group-hover:via-primary-700/40" />

              {z.status && (
                <span className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold backdrop-blur ${tone.badge.split(" ").pop()}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {z.status}
                </span>
              )}

              <span className="absolute right-4 top-4 flex h-11 w-11 -translate-y-2 translate-x-2 items-center justify-center rounded-full bg-white text-primary-600 opacity-0 shadow-lg transition duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <ArrowUpRight size={20} />
              </span>

              <span className="absolute inset-x-0 bottom-0 block p-5">
                <span className="block text-2xl font-extrabold leading-tight transition duration-500 group-hover:-translate-y-1 md:text-[1.75rem]">{z.name}</span>
                <span className="mt-2 block h-1 w-10 rounded-full bg-primary-300 transition-all duration-500 group-hover:w-28 group-hover:bg-white" />
                {z.description && <span className="mt-3 line-clamp-2 block text-sm text-white/80">{z.description}</span>}
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}
