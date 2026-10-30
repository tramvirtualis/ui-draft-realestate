import { useEffect, useRef } from "react";
import {
  Award,
  Briefcase,
  Check,
  FolderKanban,
  GraduationCap,
  Languages,
  MoreHorizontal,
  Plus,
  Sparkles,
  Target,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCvBuilder } from "./cvBuilderContext";
import { CV_STEPS, type CvStepId } from "../../types/job/cv.types";
import { isCustomComplete, isStepComplete } from "./cvCompletion";

const ICONS: Record<CvStepId, LucideIcon> = {
  personal: UserRound,
  objective: Target,
  experience: Briefcase,
  education: GraduationCap,
  skills: Sparkles,
  projects: FolderKanban,
  certificates: Award,
  languages: Languages,
  references: Users,
};

/**
 * Danh sách mục CV. Desktop: cột dọc. Tablet/mobile: thanh bước ngang cuộn được.
 * Trạng thái hoàn thành tính từ dữ liệu, không gắn cứng.
 */
export default function CvSectionNav({
  activeId,
  onSelect,
  onAddCustom,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  onAddCustom: () => void;
}) {
  const data = useCvBuilder((s) => s.data);
  const navRef = useRef<HTMLElement>(null);

  // Thanh bước ngang (tablet/mobile): cuộn mục đang chọn vào tầm nhìn
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="step"]')
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeId]);

  const items = [
    ...CV_STEPS.map((s) => ({
      id: s.id as string,
      label: s.label,
      Icon: ICONS[s.id],
      done: isStepComplete(s.id, data),
    })),
    ...data.customSections.map((c) => ({
      id: `custom:${c.id}`,
      label: c.title || "Mục tùy chỉnh",
      Icon: Plus,
      done: isCustomComplete(data, c.id),
    })),
  ];

  return (
    <nav
      ref={navRef}
      aria-label="Các mục của CV"
      className="rounded-3xl border border-line bg-white p-3 shadow-sm xl:sticky xl:top-24 xl:p-5"
    >
      <div className="mb-4 hidden items-start justify-between xl:flex">
        <div>
          <h2 className="text-lg font-medium text-heading">CV của tôi</h2>
          <p className="text-xs text-body">
            Hồ sơ ứng tuyển ngành bất động sản
          </p>
        </div>
        <button
          type="button"
          aria-label="Tùy chọn khác"
          className="rounded-full p-1.5 text-muted hover:bg-primary-50 hover:text-primary-600"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <ul className="flex gap-2 overflow-x-auto xl:flex-col xl:gap-1 xl:overflow-visible">
        {items.map(({ id, label, Icon, done }) => {
          const active = id === activeId;
          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? "step" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
                  active
                    ? "bg-primary-50 font-medium text-primary-700"
                    : "text-body hover:bg-primary-50/60"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-primary-600" : "text-muted"}
                  aria-hidden
                />
                <span className="whitespace-nowrap xl:flex-1 xl:whitespace-normal">
                  {label}
                </span>
                {done ? (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white"
                    aria-label="Đã hoàn thành"
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted/60"
                    aria-label="Chưa điền"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onAddCustom}
        className="mt-3 hidden h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-heading transition hover:border-primary-300 hover:text-primary-600 xl:flex"
      >
        <Plus size={15} aria-hidden /> Thêm mục tùy chỉnh
      </button>
      <button
        type="button"
        onClick={onAddCustom}
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-heading xl:hidden"
      >
        <Plus size={15} aria-hidden /> Thêm mục tùy chỉnh
      </button>
    </nav>
  );
}
