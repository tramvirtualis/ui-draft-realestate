import { ChevronDown } from "lucide-react";
import type { AdminProject } from "../../../../types/project/adminProject.types";

type Props = {
  projects: AdminProject[];
  value: number | null;
  counts?: Record<number, number>;
  unit?: string; // đơn vị hiển thị cạnh số lượng
  onChange: (id: number) => void;
};

export default function ProjectSelect({ projects, value, counts, unit = "ảnh", onChange }: Props) {
  return (
    <label className="relative block min-w-64">
      <span className="mb-1.5 block text-xs font-semibold text-body">Dự án</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm font-semibold text-footer shadow-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}{counts ? ` (${counts[p.id] ?? 0} ${unit})` : ""}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute bottom-4 right-4 text-muted" />
    </label>
  );
}
