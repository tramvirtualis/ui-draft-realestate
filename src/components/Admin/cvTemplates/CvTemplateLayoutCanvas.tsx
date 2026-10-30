import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Award,
  Briefcase,
  Building,
  CircleUser,
  Contact,
  GraduationCap,
  IdCard,
  Languages,
  Pencil,
  Plus,
  Quote,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
  Undo2,
  UserPen,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { wholeCardListeners } from "../../CvBuilder/dragListeners";
import { SECTION_TITLE } from "../../../types/job/cv.types";
import {
  HEADER_ZONE,
  HIDDEN_ZONE,
  MAX_COLUMNS,
  MAX_CONTENT,
  MAX_TITLE,
  PRESETS,
  WIDTH_FR,
  addColumn,
  addTextBlock,
  allZones,
  applyPreset,
  canPlace,
  deleteTextBlock,
  fieldsFor,
  findZone,
  getSetting,
  getTitle,
  hasTitle,
  isProfileBlock,
  isTextBlock,
  isZoneKey,
  mainColumn,
  moveBlock,
  removeColumn,
  setHeaderEnabled,
  setHeaderFill,
  setZoneBlocks,
  updateBlockSettings,
  updateColumn,
  zoneBlocks,
  type BlockId,
  type BlockSettings,
  type BuilderOptions,
  type BuiltinBlock,
  type ColumnWidth,
  type Fill,
  type TextBlockId,
  type ZoneKey,
} from "./templateBuilder";

type BlockMeta = { label: string; icon: LucideIcon };

const BLOCKS: Record<BuiltinBlock, BlockMeta> = {
  avatar: { label: "Ảnh đại diện", icon: CircleUser },
  identity: { label: "Họ tên & chức danh", icon: IdCard },
  contacts: { label: "Liên hệ", icon: Contact },
  summary: { label: SECTION_TITLE.summary, icon: Quote },
  objective: { label: SECTION_TITLE.objective, icon: Target },
  achievements: { label: SECTION_TITLE.achievements, icon: Trophy },
  experience: { label: SECTION_TITLE.experience, icon: Briefcase },
  projects: { label: SECTION_TITLE.projects, icon: Building },
  education: { label: SECTION_TITLE.education, icon: GraduationCap },
  skills: { label: SECTION_TITLE.skills, icon: Sparkles },
  certificates: { label: SECTION_TITLE.certificates, icon: Award },
  languages: { label: SECTION_TITLE.languages, icon: Languages },
  references: { label: SECTION_TITLE.references, icon: Users },
  custom: { label: "Mục ứng viên tự thêm", icon: UserPen },
};
const TEXT_META: BlockMeta = { label: "Mục tùy chỉnh", icon: StickyNote };

const blockMeta = (id: BlockId) => (isTextBlock(id) ? TEXT_META : BLOCKS[id]);
/** Màu icon: vàng = thông tin cá nhân, xanh = mục admin tự viết, tím = mục của ứng viên */
const iconTone = (id: BlockId) =>
  isProfileBlock(id)
    ? "text-gold-500"
    : isTextBlock(id)
    ? "text-success"
    : "text-primary-600";
/** Giá trị đặc biệt trong ô "+ Thêm thành phần" để tạo mục tùy chỉnh mới */
const NEW_TEXT = "__new_text__";

const WIDTH_LABEL: Record<ColumnWidth, string> = {
  narrow: "Hẹp",
  normal: "Vừa",
  wide: "Rộng",
};
const FILL_LABEL: Record<Fill, string> = {
  white: "Nền trắng",
  filled: "Nền màu",
  light: "Nền nhạt",
};

/** Tên hiện trên thẻ: tiêu đề admin đặt riêng, nếu có */
const blockLabel = (o: BuilderOptions, id: BlockId) =>
  getTitle(o, id) || blockMeta(id).label;

const zoneLabel = (o: BuilderOptions, zone: ZoneKey | null) =>
  zone === HEADER_ZONE
    ? "Đầu trang"
    : zone === HIDDEN_ZONE
    ? "Không dùng"
    : `Cột ${o.columns.findIndex((c) => c.id === zone) + 1}`;

const zoneStyle = (
  fill: Fill,
  color: string
): { className: string; style?: CSSProperties; onColor: boolean } =>
  fill === "filled"
    ? { className: "", style: { background: color }, onColor: true }
    : fill === "light"
    ? {
        className: "",
        style: { background: `color-mix(in srgb, ${color} 14%, white)` },
        onColor: false,
      }
    : {
        className: "border-2 border-dashed border-line bg-white",
        onColor: false,
      };

const smallSelect =
  "h-6 rounded-md border border-line bg-white px-1 text-[11px] font-medium text-heading outline-none focus:border-primary-500";

function IconButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`shrink-0 rounded p-1 text-muted transition hover:bg-primary-50 hover:text-primary-700 ${className}`}
    >
      {children}
    </button>
  );
}

/** Thẻ một thành phần; icon bên trái là tay nắm (kéo bằng bàn phím được) */
function BlockChip({
  id,
  label,
  handle,
  actions,
  className = "",
}: {
  id: BlockId;
  label: string;
  handle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const Icon = blockMeta(id).icon;
  return (
    <div
      title={label}
      className={`flex items-center gap-1 rounded-lg border border-line bg-white py-1 pl-1 pr-0.5 text-xs font-medium leading-tight text-heading shadow-sm ${className}`}
    >
      {handle ?? (
        <span className="p-1">
          <Icon size={14} className={iconTone(id)} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">{label}</span>
      {actions}
    </div>
  );
}

function SortableBlock({
  id,
  label,
  hidden,
  selected,
  disabled,
  onEdit,
  onHide,
  onRestore,
}: {
  id: BlockId;
  label: string;
  hidden: boolean;
  selected: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onHide: () => void;
  onRestore: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const Icon = blockMeta(id).icon;
  return (
    <div
      ref={setNodeRef}
      {...wholeCardListeners(listeners)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`cursor-grab touch-none active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <BlockChip
        id={id}
        label={label}
        className={selected ? "ring-2 ring-primary-500" : ""}
        handle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Kéo để di chuyển: ${label}`}
            className="cursor-grab touch-none rounded p-1 hover:bg-primary-50 active:cursor-grabbing"
          >
            <Icon size={14} className={iconTone(id)} aria-hidden />
          </button>
        }
        actions={
          disabled ? null : hidden ? (
            <IconButton label={`Dùng lại: ${label}`} onClick={onRestore}>
              <Undo2 size={13} />
            </IconButton>
          ) : (
            <>
              <IconButton
                label={`Chỉnh sửa: ${label}`}
                onClick={onEdit}
                className={selected ? "bg-primary-50 text-primary-700" : ""}
              >
                <Pencil size={13} />
              </IconButton>
              {canPlace(id, HIDDEN_ZONE) && (
                <IconButton
                  label={
                    isTextBlock(id) ? `Xóa: ${label}` : `Bỏ khỏi mẫu: ${label}`
                  }
                  onClick={onHide}
                  className="hover:text-danger"
                >
                  <X size={13} />
                </IconButton>
              )}
            </>
          )
        }
      />
    </div>
  );
}

/**
 * Ô "+ Thêm thành phần" cuối mỗi vùng: tạo mục tùy chỉnh mới, lấy thành phần đang ẩn
 * hoặc chuyển từ vùng khác sang
 */
function AddBlock({
  o,
  zone,
  disabled,
  onAdd,
  onCreate,
}: {
  o: BuilderOptions;
  zone: ZoneKey;
  disabled?: boolean;
  onAdd: (id: BlockId) => void;
  onCreate: () => void;
}) {
  const elsewhere = allZones(o)
    .filter((z) => z !== zone && z !== HIDDEN_ZONE)
    .flatMap((z) => zoneBlocks(o, z).map((b) => ({ b, z })));
  return (
    <select
      value=""
      disabled={disabled}
      aria-label={`Thêm thành phần vào ${zoneLabel(o, zone).toLowerCase()}`}
      onChange={(e) => {
        const v = e.target.value;
        if (v === NEW_TEXT) onCreate();
        else if (v) onAdd(v as BlockId);
      }}
      className="mt-2 h-7 w-full cursor-pointer rounded-lg border border-dashed border-primary-300 bg-white/90 px-2 text-xs font-semibold text-primary-700 outline-none focus:border-primary-500 disabled:opacity-60"
    >
      <option value="">+ Thêm thành phần…</option>
      <option value={NEW_TEXT}>Mục tùy chỉnh mới (tự viết nội dung)</option>
      {o.hidden.length > 0 && (
        <optgroup label="Đang không dùng">
          {o.hidden.map((b) => (
            <option key={b} value={b}>
              {blockLabel(o, b)}
            </option>
          ))}
        </optgroup>
      )}
      {elsewhere.length > 0 && (
        <optgroup label="Chuyển từ vùng khác">
          {elsewhere.map(({ b, z }) => (
            <option key={b} value={b}>
              {blockLabel(o, b)} — đang ở {zoneLabel(o, z).toLowerCase()}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

function Zone({
  zone,
  title,
  tools,
  horizontal = false,
  emptyText = "Kéo thành phần vào đây",
  className = "",
  style,
  onColor = false,
  o,
  activeId,
  selected,
  disabled,
  onEdit,
  onMove,
  onCreate,
  onDelete,
}: {
  zone: ZoneKey;
  title: ReactNode;
  tools?: ReactNode;
  horizontal?: boolean;
  emptyText?: string;
  className?: string;
  style?: CSSProperties;
  onColor?: boolean;
  o: BuilderOptions;
  activeId: BlockId | null;
  selected: BlockId | null;
  disabled?: boolean;
  onEdit: (id: BlockId) => void;
  onMove: (id: BlockId, to: ZoneKey) => void;
  onCreate: (zone: ZoneKey) => void;
  onDelete: (id: TextBlockId) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone, disabled });
  const items = zoneBlocks(o, zone);
  const blocked = activeId !== null && !canPlace(activeId, zone);
  const isHidden = zone === HIDDEN_ZONE;
  // thành phần bỏ ra thì về khay "Không dùng"; dùng lại thì về đầu trang (thông tin cá nhân) hoặc cột chính
  const restoreTo = (id: BlockId) =>
    isProfileBlock(id) && o.header.enabled
      ? HEADER_ZONE
      : mainColumn(o.columns).id;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${
        horizontal ? "" : "min-h-24"
      } min-w-0 rounded-xl p-2 transition ${className} ${
        blocked ? "opacity-40" : ""
      } ${isOver && !blocked ? "ring-2 ring-primary-400 ring-offset-1" : ""}`}
    >
      <div
        className={`mb-2 flex flex-wrap items-center gap-1 ${
          onColor ? "text-white/85" : "text-muted"
        }`}
      >
        <span className="mr-auto text-[11px] font-semibold uppercase tracking-wide">
          {title}
        </span>
        {tools}
      </div>
      <SortableContext
        items={items}
        strategy={
          horizontal ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        <div className={horizontal ? "flex flex-wrap gap-1.5" : "space-y-1.5"}>
          {items.map((id) => (
            <SortableBlock
              key={id}
              id={id}
              label={blockLabel(o, id)}
              hidden={isHidden}
              selected={selected === id}
              disabled={disabled}
              onEdit={() => onEdit(id)}
              onHide={() =>
                isTextBlock(id) ? onDelete(id) : onMove(id, HIDDEN_ZONE)
              }
              onRestore={() => onMove(id, restoreTo(id))}
            />
          ))}
        </div>
      </SortableContext>
      {items.length === 0 && (
        <p
          className={`py-2 text-center text-xs ${
            onColor ? "text-white/70" : "text-muted"
          }`}
        >
          {emptyText}
        </p>
      )}
      {!isHidden && (
        <AddBlock
          o={o}
          zone={zone}
          disabled={disabled}
          onAdd={(id) => onMove(id, zone)}
          onCreate={() => onCreate(zone)}
        />
      )}
    </div>
  );
}

/** Sơ đồ thu nhỏ của bố cục dựng sẵn */
function PresetThumb({ preset }: { preset: (typeof PRESETS)[number] }) {
  const tone = (fill: Fill) =>
    fill === "filled"
      ? "bg-primary-600"
      : fill === "light"
      ? "bg-primary-100"
      : "bg-white";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-gray-200">
      {preset.header && (
        <div
          className={`h-1/4 shrink-0 ${
            preset.header === "filled"
              ? "bg-primary-600"
              : "border-b border-gray-300 bg-white"
          }`}
        />
      )}
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: preset.columns
            .map(([w]) => `${WIDTH_FR[w]}fr`)
            .join(" "),
        }}
      >
        {preset.columns.map(([, fill], i) => (
          <div key={i} className={`space-y-0.5 p-0.5 ${tone(fill)}`}>
            {fill !== "filled" && (
              <>
                <div className="h-0.5 rounded bg-gray-300" />
                <div className="h-0.5 w-3/4 rounded bg-gray-200" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ô cài đặt của thành phần đang chọn: tiêu đề, nội dung (mục tùy chỉnh) và kiểu hiển thị */
function BlockSettingsPanel({
  o,
  block,
  onChange,
  onDelete,
  onClose,
}: {
  o: BuilderOptions;
  block: BlockId;
  onChange: (patch: BlockSettings) => void;
  onDelete: (id: TextBlockId) => void;
  onClose: () => void;
}) {
  const { label, icon: Icon } = blockMeta(block);
  const fields = fieldsFor(block);
  const text = isTextBlock(block);
  const defaultTitle =
    block === "contacts" ? "Liên hệ" : SECTION_TITLE[block] ?? "";
  const input =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 text-sm font-normal outline-none focus:border-primary-500";
  return (
    <section
      className="rounded-2xl border border-primary-200 bg-primary-50/50 p-4"
      aria-label={`Chỉnh sửa ${label}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={iconTone(block)} aria-hidden />
        <h3 className="text-sm font-bold text-heading">{label}</h3>
        <span className="text-xs text-muted">
          · {zoneLabel(o, findZone(o, block))}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-white"
        >
          Xong
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {text && (
          <p className="text-xs text-body">
            Nội dung do admin viết, hiện giống nhau trên mọi CV dùng mẫu này
            (vd: Lời cam đoan, Sở thích chung của vị trí…).
          </p>
        )}
        {hasTitle(block) && (
          <label className="block text-xs font-semibold text-heading">
            {text ? "Tiêu đề" : "Tiêu đề trên CV"}
            <input
              value={o.blocks[block]?.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              maxLength={MAX_TITLE}
              placeholder={text ? "Vd: Lời cam đoan" : defaultTitle}
              className={`${input} h-9`}
            />
            <span className="mt-1 block font-normal text-muted">
              {text
                ? "Để trống thì mục không có tiêu đề."
                : `Để trống thì dùng tên mặc định “${defaultTitle}”.`}
            </span>
          </label>
        )}
        {text && (
          <label className="block text-xs font-semibold text-heading">
            Nội dung
            <textarea
              value={o.blocks[block]?.content ?? ""}
              onChange={(e) => onChange({ content: e.target.value })}
              maxLength={MAX_CONTENT}
              rows={4}
              placeholder="Vd: Tôi xin cam đoan những thông tin trên là đúng sự thật."
              className={`${input} resize-y py-2`}
            />
          </label>
        )}
        {fields.map((f) => {
          const current = getSetting(o, block, f.key);
          return (
            <div key={f.key}>
              <p className="text-xs font-semibold text-heading">{f.label}</p>
              <div
                className="mt-1 flex flex-wrap gap-1.5"
                role="radiogroup"
                aria-label={f.label}
              >
                {f.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={current === opt.value}
                    onClick={() => onChange({ [f.key]: opt.value })}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                      current === opt.value
                        ? "border-primary-600 bg-white font-semibold text-primary-700"
                        : "border-line bg-white text-body hover:border-primary-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {block === "custom" && (
          <p className="text-xs text-body">
            Chỗ hiện các mục ứng viên tự thêm ở trang Tạo CV (tiêu đề và nội
            dung do ứng viên viết). Muốn tự viết nội dung cho mẫu, chọn “+ Thêm
            thành phần → Mục tùy chỉnh mới”. Không muốn hiện mục của ứng viên
            thì bấm ✕ trên thẻ này.
          </p>
        )}
        {!hasTitle(block) && fields.length === 0 && block !== "custom" && (
          <p className="text-xs text-body">
            Thành phần này không có tùy chọn riêng.
          </p>
        )}
        {text && (
          <button
            type="button"
            onClick={() => onDelete(block)}
            className="rounded-lg border border-danger/40 bg-white px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/5"
          >
            Xóa mục này
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * Bảng dựng mẫu: bật đầu trang, thêm / xóa cột, kéo thả thành phần giữa các vùng,
 * thêm / bỏ thành phần ở từng cột và chỉnh tiêu đề, kiểu hiển thị của từng thành phần.
 */
export default function CvTemplateLayoutCanvas({
  value,
  onChange,
  color,
  disabled,
}: {
  value: BuilderOptions;
  onChange: (v: BuilderOptions) => void;
  /** Màu chủ đạo đang chọn, tô cho vùng nền màu giống CV thật */
  color: string;
  disabled?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Trong lúc kéo giữ bản nháp riêng, thả tay mới ghi vào mẫu (preview không render lại liên tục)
  const [drag, setDrag] = useState<{
    id: BlockId;
    draft: BuilderOptions;
  } | null>(null);
  const [selected, setSelected] = useState<BlockId | null>(null);
  const o = drag?.draft ?? value;

  // Vừa chuyển sang vùng khác thì chờ một khung hình, tránh thẻ nhảy qua lại giữa hai vùng
  const justMoved = useRef(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      justMoved.current = false;
    });
    return () => cancelAnimationFrame(raf);
  }, [drag?.draft]);

  const move = (id: BlockId, to: ZoneKey) => {
    onChange(moveBlock(value, id, to));
    if (to === HIDDEN_ZONE && selected === id) setSelected(null);
  };
  // mục mới mở luôn ô chỉnh sửa để admin viết nội dung
  const createText = (zone: ZoneKey) => {
    const { next, id } = addTextBlock(value, zone);
    onChange(next);
    setSelected(id);
  };
  const deleteText = (id: TextBlockId) => {
    const hasContent = Boolean(value.blocks[id]?.content?.trim());
    if (
      hasContent &&
      !window.confirm(`Xóa “${blockLabel(value, id)}” và nội dung đã viết?`)
    )
      return;
    onChange(deleteTextBlock(value, id));
    if (selected === id) setSelected(null);
  };
  const zoneProps = {
    o,
    activeId: drag?.id ?? null,
    selected,
    disabled,
    onEdit: (id: BlockId) => setSelected((s) => (s === id ? null : id)),
    onMove: move,
    onCreate: createText,
    onDelete: deleteText,
  };

  const onDragStart = ({ active }: DragStartEvent) =>
    setDrag({ id: active.id as BlockId, draft: value });

  const onDragOver = ({ over }: DragOverEvent) => {
    const overId = over ? String(over.id) : null;
    if (!overId || justMoved.current) return;
    setDrag((d) => {
      if (!d) return d;
      const from = findZone(d.draft, d.id);
      const to = isZoneKey(overId)
        ? overId
        : findZone(d.draft, overId as BlockId);
      if (!from || !to || from === to || !canPlace(d.id, to)) return d;
      const target = zoneBlocks(d.draft, to);
      const at = target.indexOf(overId as BlockId);
      justMoved.current = true;
      return {
        ...d,
        draft: moveBlock(d.draft, d.id, to, at >= 0 ? at : target.length),
      };
    });
  };

  const onDragEnd = ({ over }: DragEndEvent) => {
    const d = drag;
    setDrag(null);
    if (!d) return;
    let next = d.draft;
    const overId = over ? String(over.id) : null;
    const zone = findZone(next, d.id);
    if (
      overId &&
      zone &&
      zone === (isZoneKey(overId) ? overId : findZone(next, overId as BlockId))
    ) {
      const items = zoneBlocks(next, zone);
      const from = items.indexOf(d.id);
      const to = items.indexOf(overId as BlockId);
      if (to >= 0 && from !== to)
        next = setZoneBlocks(next, zone, arrayMove(items, from, to));
    }
    if (next !== value) onChange(next);
  };

  const headerStyle = zoneStyle(o.header.fill, color);
  const canAddColumn = o.columns.length < MAX_COLUMNS;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDrag(null)}
    >
      <div className="space-y-3">
        <div className="space-y-3 rounded-2xl border border-line bg-gray-50/70 p-3">
          {/* Bố cục dựng sẵn + đầu trang */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-body">
              Bố cục nhanh:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                aria-label={`Bố cục ${preset.label}`}
                disabled={disabled}
                onClick={() => onChange(applyPreset(value, preset.id))}
                className="h-9 w-12 rounded-md bg-white p-0.5 ring-1 ring-line transition hover:ring-2 hover:ring-primary-400 disabled:opacity-60"
              >
                <PresetThumb preset={preset} />
              </button>
            ))}
            <label className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-heading">
              <input
                type="checkbox"
                checked={o.header.enabled}
                disabled={disabled}
                onChange={(e) =>
                  onChange(setHeaderEnabled(value, e.target.checked))
                }
                className="h-4 w-4 accent-primary-600"
              />
              Có đầu trang
            </label>
          </div>

          {o.header.enabled && (
            <Zone
              {...zoneProps}
              zone={HEADER_ZONE}
              title="Đầu trang"
              horizontal
              className={headerStyle.className}
              style={headerStyle.style}
              onColor={headerStyle.onColor}
              tools={
                <select
                  aria-label="Nền đầu trang"
                  value={o.header.fill}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(setHeaderFill(value, e.target.value as Fill))
                  }
                  className={smallSelect}
                >
                  {(Object.keys(FILL_LABEL) as Fill[]).map((f) => (
                    <option key={f} value={f}>
                      {FILL_LABEL[f]}
                    </option>
                  ))}
                </select>
              }
            />
          )}

          {/* Cột: độ rộng trên bảng theo đúng tỉ lệ trên CV */}
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: [
                ...o.columns.map((c) => `minmax(0, ${WIDTH_FR[c.width]}fr)`),
                ...(canAddColumn ? ["auto"] : []),
              ].join(" "),
            }}
          >
            {o.columns.map((col, i) => {
              const s = zoneStyle(col.fill, color);
              return (
                <Zone
                  {...zoneProps}
                  key={col.id}
                  zone={col.id}
                  title={`Cột ${i + 1}`}
                  className={s.className}
                  style={s.style}
                  onColor={s.onColor}
                  tools={
                    <>
                      <select
                        aria-label={`Độ rộng cột ${i + 1}`}
                        value={col.width}
                        disabled={disabled}
                        onChange={(e) =>
                          onChange(
                            updateColumn(value, col.id, {
                              width: e.target.value as ColumnWidth,
                            })
                          )
                        }
                        className={smallSelect}
                      >
                        {(Object.keys(WIDTH_LABEL) as ColumnWidth[]).map(
                          (w) => (
                            <option key={w} value={w}>
                              {WIDTH_LABEL[w]}
                            </option>
                          )
                        )}
                      </select>
                      <select
                        aria-label={`Nền cột ${i + 1}`}
                        value={col.fill}
                        disabled={disabled}
                        onChange={(e) =>
                          onChange(
                            updateColumn(value, col.id, {
                              fill: e.target.value as Fill,
                            })
                          )
                        }
                        className={smallSelect}
                      >
                        {(Object.keys(FILL_LABEL) as Fill[]).map((f) => (
                          <option key={f} value={f}>
                            {FILL_LABEL[f]}
                          </option>
                        ))}
                      </select>
                      {o.columns.length > 1 && !disabled && (
                        <IconButton
                          label={`Xóa cột ${
                            i + 1
                          } (thành phần dồn sang cột bên cạnh)`}
                          onClick={() => onChange(removeColumn(value, col.id))}
                          className={
                            s.onColor
                              ? "text-white/80 hover:bg-white/20 hover:text-white"
                              : "hover:text-danger"
                          }
                        >
                          <X size={13} />
                        </IconButton>
                      )}
                    </>
                  }
                />
              );
            })}
            {canAddColumn && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(addColumn(value))}
                title="Thêm cột"
                className="flex w-10 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 text-primary-700 transition hover:bg-primary-50 disabled:opacity-60"
              >
                <Plus size={16} />
                <span className="text-xs font-semibold [writing-mode:vertical-rl]">
                  Thêm cột
                </span>
              </button>
            )}
          </div>
        </div>

        <Zone
          {...zoneProps}
          zone={HIDDEN_ZONE}
          title={
            <>
              Không dùng{" "}
              <span className="font-normal normal-case tracking-normal">
                — thành phần bỏ khỏi mẫu
              </span>
            </>
          }
          horizontal
          emptyText="Chưa bỏ thành phần nào"
          className="border-2 border-dashed border-gray-300 bg-white"
        />

        {selected ? (
          <BlockSettingsPanel
            o={value}
            block={selected}
            onChange={(patch) =>
              onChange(updateBlockSettings(value, selected, patch))
            }
            onDelete={deleteText}
            onClose={() => setSelected(null)}
          />
        ) : (
          <p className="text-xs text-body">
            Bấm{" "}
            <Pencil size={11} className="inline" aria-label="nút chỉnh sửa" />{" "}
            trên một thẻ để đổi tiêu đề và kiểu hiển thị của thành phần đó. Muốn
            tự viết nội dung cho mẫu, chọn “+ Thêm thành phần → Mục tùy chỉnh
            mới”.
          </p>
        )}
      </div>

      <DragOverlay>
        {drag ? (
          <BlockChip
            id={drag.id}
            label={blockLabel(o, drag.id)}
            className="cursor-grabbing shadow-lg ring-2 ring-primary-300"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
