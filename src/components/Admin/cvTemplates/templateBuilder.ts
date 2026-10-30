export const MAX_COLUMNS = 3;

const WIDTHS = ["narrow", "normal", "wide"] as const;
export type ColumnWidth = (typeof WIDTHS)[number];
const FILLS = ["white", "filled", "light"] as const;
export type Fill = (typeof FILLS)[number];
const HEADINGS = ["underline", "bar", "left-border", "plain"] as const;
export type BuilderHeading = (typeof HEADINGS)[number];
const DENSITIES = ["compact", "normal", "airy"] as const;
export type BuilderDensity = (typeof DENSITIES)[number];
const ALIGNS = ["left", "center"] as const;
export type BuilderAlign = (typeof ALIGNS)[number];

export const PROFILE_BLOCKS = ["avatar", "identity", "contacts"] as const;
export const SECTION_BLOCKS = [
  "summary",
  "objective",
  "achievements",
  "experience",
  "projects",
  "education",
  "skills",
  "certificates",
  "languages",
  "references",
  "custom",
] as const;
export type ProfileBlock = (typeof PROFILE_BLOCKS)[number];
export type SectionBlock = (typeof SECTION_BLOCKS)[number];
/** Mục tùy chỉnh admin tự viết tiêu đề + nội dung, vd "text:t1" */
export type TextBlockId = `text:${string}`;
export type BuiltinBlock = ProfileBlock | SectionBlock;
export type BlockId = BuiltinBlock | TextBlockId;
const ALL_BLOCKS: readonly BuiltinBlock[] = [
  ...PROFILE_BLOCKS,
  ...SECTION_BLOCKS,
];

export const isProfileBlock = (b: BlockId): b is ProfileBlock =>
  (PROFILE_BLOCKS as readonly string[]).includes(b);
const TEXT_ID = /^text:[a-z0-9-]{1,20}$/i;
export const isTextBlock = (b: string): b is TextBlockId => TEXT_ID.test(b);
const isBlockId = (b: unknown): b is BlockId =>
  typeof b === "string" &&
  (ALL_BLOCKS.includes(b as BuiltinBlock) || isTextBlock(b));
/** Hiện cố định theo mẫu, không lấy từ danh sách mục của ứng viên */
export const isStaticBlock = (b: BlockId) =>
  isProfileBlock(b) || isTextBlock(b);

type SettingKey = "shape" | "size" | "layout" | "style" | "dates";
export interface BlockSettings extends Partial<Record<SettingKey, string>> {
  title?: string;
  /** Nội dung của mục tùy chỉnh do admin viết */
  content?: string;
}
export interface SettingField {
  key: SettingKey;
  label: string;
  options: readonly { value: string; label: string }[];
}

const DATES: SettingField = {
  key: "dates",
  label: "Thời gian",
  options: [
    { value: "right", label: "Bên phải" },
    { value: "below", label: "Dưới tiêu đề" },
  ],
};

export const BLOCK_FIELDS: Partial<
  Record<BuiltinBlock, readonly SettingField[]>
> = {
  avatar: [
    {
      key: "shape",
      label: "Hình dạng",
      options: [
        { value: "circle", label: "Tròn" },
        { value: "rounded", label: "Bo góc" },
        { value: "square", label: "Vuông" },
      ],
    },
    {
      key: "size",
      label: "Kích thước",
      options: [
        { value: "md", label: "Vừa" },
        { value: "sm", label: "Nhỏ" },
        { value: "lg", label: "Lớn" },
      ],
    },
  ],
  identity: [
    {
      key: "size",
      label: "Cỡ chữ họ tên",
      options: [
        { value: "md", label: "Vừa" },
        { value: "lg", label: "Lớn" },
      ],
    },
  ],
  contacts: [
    {
      key: "layout",
      label: "Kiểu",
      options: [
        { value: "auto", label: "Tự động theo cột" },
        { value: "list", label: "Danh sách có nhãn" },
        { value: "inline", label: "Một dòng" },
      ],
    },
  ],
  experience: [
    {
      key: "style",
      label: "Kiểu",
      options: [
        { value: "plain", label: "Thường" },
        { value: "timeline", label: "Đường thời gian" },
      ],
    },
    DATES,
  ],
  projects: [DATES],
  education: [DATES],
  skills: [
    {
      key: "layout",
      label: "Kiểu",
      options: [
        { value: "list", label: "Gạch đầu dòng" },
        { value: "tags", label: "Nhãn bo tròn" },
        { value: "two-col", label: "Hai cột" },
      ],
    },
  ],
  references: [
    {
      key: "layout",
      label: "Bố trí",
      options: [
        { value: "auto", label: "Tự chia cột" },
        { value: "one", label: "Một cột" },
      ],
    },
  ],
};

const TEXT_FIELDS: readonly SettingField[] = [
  {
    key: "layout",
    label: "Kiểu nội dung",
    options: [
      { value: "paragraph", label: "Đoạn văn" },
      { value: "bullets", label: "Gạch đầu dòng" },
    ],
  },
];

export const fieldsFor = (b: BlockId): readonly SettingField[] =>
  isTextBlock(b) ? TEXT_FIELDS : BLOCK_FIELDS[b] ?? [];

/** Thành phần đặt được tiêu đề riêng ("custom" dùng tiêu đề ứng viên tự đặt) */
export const hasTitle = (b: BlockId) =>
  b === "contacts" ||
  isTextBlock(b) ||
  (!isProfileBlock(b) && b !== "custom");
export const MAX_TITLE = 60;
export const MAX_CONTENT = 1500;

/** Giá trị cài đặt (đã kiểm tra hợp lệ), không có thì lấy mặc định */
export function getSetting(
  o: BuilderOptions,
  block: BlockId,
  key: SettingKey
): string {
  const field = fieldsFor(block).find((f) => f.key === key);
  const value = o.blocks[block]?.[key];
  return field?.options.some((x) => x.value === value)
    ? (value as string)
    : field?.options[0].value ?? "";
}
export const getTitle = (o: BuilderOptions, block: BlockId) =>
  hasTitle(block) ? (o.blocks[block]?.title ?? "").trim() : "";

/* ---------------------------------- Cấu trúc ---------------------------------- */

export interface BuilderHeader {
  enabled: boolean;
  fill: Fill;
  blocks: BlockId[];
}
export interface BuilderColumn {
  id: string;
  width: ColumnWidth;
  fill: Fill;
  blocks: BlockId[];
}

export interface BuilderOptions {
  header: BuilderHeader;
  columns: BuilderColumn[];
  /** Thành phần không dùng trong mẫu */
  hidden: BlockId[];
  /** Cài đặt riêng của từng thành phần */
  blocks: Partial<Record<BlockId, BlockSettings>>;
  heading: BuilderHeading;
  density: BuilderDensity;
  align: BuilderAlign;
}

/** Tỉ lệ độ rộng cột (hẹp + rộng = 1/3 + 2/3) */
export const WIDTH_FR: Record<ColumnWidth, number> = {
  narrow: 2,
  normal: 3,
  wide: 4,
};

export const DEFAULT_BUILDER: BuilderOptions = {
  header: { enabled: false, fill: "filled", blocks: [] },
  columns: [
    {
      id: "c1",
      width: "narrow",
      fill: "filled",
      blocks: [
        "avatar",
        "identity",
        "contacts",
        "skills",
        "languages",
        "certificates",
      ],
    },
    {
      id: "c2",
      width: "wide",
      fill: "white",
      blocks: [
        "summary",
        "objective",
        "achievements",
        "experience",
        "projects",
        "education",
        "references",
        "custom",
      ],
    },
  ],
  hidden: [],
  blocks: {},
  heading: "underline",
  density: "normal",
  align: "center",
};

/* ------------------------------ Vùng & di chuyển ------------------------------ */

/** Vùng chứa thành phần: "header" | "hidden" | id của cột ("c1"…) */
export type ZoneKey = string;
export const HEADER_ZONE: ZoneKey = "header";
export const HIDDEN_ZONE: ZoneKey = "hidden";
const COLUMN_ID = /^c\d+$/;
export const isZoneKey = (id: string) =>
  id === HEADER_ZONE || id === HIDDEN_ZONE || COLUMN_ID.test(id);

/** Họ tên luôn phải hiện; còn lại đặt ở đâu cũng được */
export const canPlace = (block: BlockId, zone: ZoneKey) =>
  zone !== HIDDEN_ZONE || block !== "identity";

export function zoneBlocks(o: BuilderOptions, zone: ZoneKey): BlockId[] {
  if (zone === HIDDEN_ZONE) return o.hidden;
  if (zone === HEADER_ZONE) return o.header.blocks;
  return o.columns.find((c) => c.id === zone)?.blocks ?? [];
}

export function setZoneBlocks(
  o: BuilderOptions,
  zone: ZoneKey,
  blocks: BlockId[]
): BuilderOptions {
  if (zone === HIDDEN_ZONE) return { ...o, hidden: blocks };
  if (zone === HEADER_ZONE) return { ...o, header: { ...o.header, blocks } };
  return {
    ...o,
    columns: o.columns.map((c) => (c.id === zone ? { ...c, blocks } : c)),
  };
}

/** Mọi vùng đang dùng được (đầu trang tắt thì không tính) */
export const allZones = (o: BuilderOptions): ZoneKey[] => [
  ...(o.header.enabled ? [HEADER_ZONE] : []),
  ...o.columns.map((c) => c.id),
  HIDDEN_ZONE,
];

export const findZone = (o: BuilderOptions, block: BlockId): ZoneKey | null =>
  allZones(o).find((z) => zoneBlocks(o, z).includes(block)) ?? null;

/** Chuyển thành phần sang vùng khác (mặc định xuống cuối vùng) */
export function moveBlock(
  o: BuilderOptions,
  block: BlockId,
  to: ZoneKey,
  index?: number
): BuilderOptions {
  if (!canPlace(block, to)) return o;
  const from = findZone(o, block);
  const next = from
    ? setZoneBlocks(
        o,
        from,
        zoneBlocks(o, from).filter((b) => b !== block)
      )
    : o;
  const target = [...zoneBlocks(next, to)];
  target.splice(index ?? target.length, 0, block);
  return setZoneBlocks(next, to, target);
}

/** Cột chính: cột rộng nhất (ưu tiên cột bên trái) */
export const mainColumn = (columns: BuilderColumn[]) =>
  columns.reduce(
    (best, c) => (WIDTH_FR[c.width] > WIDTH_FR[best.width] ? c : best),
    columns[0]
  );

/** Tạo id cột ("c1"…) chưa dùng */
function idMaker(columns: BuilderColumn[]) {
  const used = new Set(columns.map((c) => c.id));
  return () => {
    let n = 1;
    while (used.has(`c${n}`)) n++;
    used.add(`c${n}`);
    return `c${n}`;
  };
}

export function addColumn(o: BuilderOptions): BuilderOptions {
  if (o.columns.length >= MAX_COLUMNS) return o;
  return {
    ...o,
    columns: [
      ...o.columns,
      { id: idMaker(o.columns)(), width: "normal", fill: "white", blocks: [] },
    ],
  };
}

/** Xóa cột; thành phần trong cột dồn sang cột bên cạnh */
export function removeColumn(
  o: BuilderOptions,
  columnId: string
): BuilderOptions {
  const i = o.columns.findIndex((c) => c.id === columnId);
  if (i < 0 || o.columns.length <= 1) return o;
  const neighbor = o.columns[i > 0 ? i - 1 : 1];
  const moved = o.columns[i].blocks;
  return {
    ...o,
    columns: o.columns
      .filter((c) => c.id !== columnId)
      .map((c) =>
        c.id === neighbor.id ? { ...c, blocks: [...c.blocks, ...moved] } : c
      ),
  };
}

export const updateColumn = (
  o: BuilderOptions,
  columnId: string,
  patch: Partial<Pick<BuilderColumn, "width" | "fill">>
) => ({
  ...o,
  columns: o.columns.map((c) => (c.id === columnId ? { ...c, ...patch } : c)),
});

/** Bật đầu trang: đưa thông tin cá nhân lên đó. Tắt: trả thành phần về đầu cột thứ nhất */
export function setHeaderEnabled(
  o: BuilderOptions,
  enabled: boolean
): BuilderOptions {
  if (enabled === o.header.enabled) return o;
  if (enabled) {
    const profile = o.columns.flatMap((c) => c.blocks).filter(isProfileBlock);
    return {
      ...o,
      header: {
        ...o.header,
        enabled,
        blocks: [...o.header.blocks, ...profile],
      },
      columns: o.columns.map((c) => ({
        ...c,
        blocks: c.blocks.filter((b) => !isProfileBlock(b)),
      })),
    };
  }
  return {
    ...o,
    header: { ...o.header, enabled, blocks: [] },
    columns: o.columns.map((c, i) =>
      i === 0 ? { ...c, blocks: [...o.header.blocks, ...c.blocks] } : c
    ),
  };
}

export const setHeaderFill = (
  o: BuilderOptions,
  fill: Fill
): BuilderOptions => ({ ...o, header: { ...o.header, fill } });

/** Ghi cài đặt của một thành phần (giá trị rỗng = về mặc định) */
export function updateBlockSettings(
  o: BuilderOptions,
  block: BlockId,
  patch: BlockSettings
): BuilderOptions {
  const next: BlockSettings = { ...o.blocks[block], ...patch };
  for (const k of Object.keys(next) as (keyof BlockSettings)[])
    if (!next[k]) delete next[k];
  return { ...o, blocks: { ...o.blocks, [block]: next } };
}

/** Tạo mục tùy chỉnh mới (admin tự viết) ở cuối vùng */
export function addTextBlock(
  o: BuilderOptions,
  zone: ZoneKey
): { next: BuilderOptions; id: TextBlockId } {
  const used = new Set<string>(Object.keys(o.blocks));
  for (const z of allZones(o)) zoneBlocks(o, z).forEach((b) => used.add(b));
  let n = 1;
  while (used.has(`text:t${n}`)) n++;
  const id: TextBlockId = `text:t${n}`;
  const next = updateBlockSettings(o, id, { title: "Mục tùy chỉnh" });
  return { next: moveBlock(next, id, zone), id };
}

/** Xóa hẳn mục tùy chỉnh do admin tạo (thành phần có sẵn thì chỉ ẩn được) */
export function deleteTextBlock(
  o: BuilderOptions,
  id: TextBlockId
): BuilderOptions {
  const zone = findZone(o, id);
  const next = zone
    ? setZoneBlocks(o, zone, zoneBlocks(o, zone).filter((b) => b !== id))
    : o;
  const blocks = { ...next.blocks };
  delete blocks[id];
  return { ...next, blocks };
}

/* --------------------------------- Bố cục dựng sẵn --------------------------------- */

export const PRESETS = [
  {
    id: "sidebar-left",
    label: "Cột màu bên trái",
    header: null,
    columns: [
      ["narrow", "filled"],
      ["wide", "white"],
    ],
  },
  {
    id: "sidebar-right",
    label: "Cột màu bên phải",
    header: null,
    columns: [
      ["wide", "white"],
      ["narrow", "filled"],
    ],
  },
  {
    id: "header-band",
    label: "Đầu trang màu",
    header: "filled",
    columns: [["normal", "white"]],
  },
  {
    id: "single",
    label: "Một cột đơn giản",
    header: "white",
    columns: [["normal", "white"]],
  },
  {
    id: "three",
    label: "Ba cột",
    header: "filled",
    columns: [
      ["narrow", "light"],
      ["normal", "white"],
      ["normal", "white"],
    ],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  header: Fill | null;
  columns: readonly (readonly [ColumnWidth, Fill])[];
}[];
export type PresetId = (typeof PRESETS)[number]["id"];

/** Mục ngắn hợp cột hẹp; mục dài ở cột chính; còn lại sang cột phụ nếu có */
const SHORT_SECTIONS: readonly BlockId[] = [
  "skills",
  "languages",
  "certificates",
];
const LONG_SECTIONS: readonly BlockId[] = [
  "summary",
  "objective",
  "achievements",
  "experience",
];

/** Đổi cấu trúc theo bố cục dựng sẵn, giữ nguyên các thành phần đang dùng */
export function applyPreset(
  o: BuilderOptions,
  presetId: PresetId
): BuilderOptions {
  const preset = PRESETS.find((x) => x.id === presetId);
  if (!preset) return o;
  const blocks = [...o.header.blocks, ...o.columns.flatMap((c) => c.blocks)];
  const nextId = idMaker(o.columns);
  const columns: BuilderColumn[] = preset.columns.map(([width, fill], i) => ({
    id: o.columns[i]?.id ?? nextId(),
    width,
    fill,
    blocks: [],
  }));
  const header: BuilderHeader = {
    enabled: preset.header !== null,
    fill: preset.header ?? o.header.fill,
    blocks: [],
  };
  const side = columns.find((c) => c.width === "narrow");
  const main = mainColumn(columns);
  const extra = columns.find((c) => c !== side && c !== main);
  for (const b of blocks) {
    if (isProfileBlock(b))
      (header.enabled ? header : side ?? columns[0]).blocks.push(b);
    else if (SHORT_SECTIONS.includes(b)) (side ?? extra ?? main).blocks.push(b);
    else if (LONG_SECTIONS.includes(b)) main.blocks.push(b);
    else (extra ?? main).blocks.push(b);
  }
  return { ...o, header, columns };
}

/* ------------------------------- Đọc & thứ tự mục ------------------------------- */

/** Thứ tự mục mặc định của mẫu (lưu vào defaultConfig.sectionOrder): đầu trang, rồi cột rộng trước */
export function builderSectionOrder(o: BuilderOptions): SectionBlock[] {
  const cols = [...o.columns].sort(
    (a, b) => WIDTH_FR[b.width] - WIDTH_FR[a.width]
  );
  return [
    ...o.header.blocks,
    ...cols.flatMap((c) => c.blocks),
    ...o.hidden,
  ].filter((b): b is SectionBlock => !isStaticBlock(b));
}

const oneOf = <T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T
): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : fallback;

const toBlocks = (v: unknown): BlockId[] =>
  Array.isArray(v) ? v.filter(isBlockId) : [];

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

const readHeader = (v: unknown): BuilderHeader => {
  const h = asRecord(v);
  return {
    enabled: h.enabled === true,
    fill: oneOf(h.fill, FILLS, "filled"),
    blocks: toBlocks(h.blocks),
  };
};

const readColumns = (v: unknown): BuilderColumn[] => {
  const cols = Array.isArray(v) ? v.map(asRecord) : [];
  return (cols.length ? cols : [{}]).map((c, i) => ({
    id: typeof c.id === "string" ? c.id : `c${i + 1}`,
    width: oneOf(c.width, WIDTHS, "normal"),
    fill: oneOf(c.fill, FILLS, "white"),
    blocks: toBlocks(c.blocks),
  }));
};

function readBlockSettings(
  v: unknown
): Partial<Record<BlockId, BlockSettings>> {
  const raw = asRecord(v);
  const out: Partial<Record<BlockId, BlockSettings>> = {};
  for (const b of [...ALL_BLOCKS, ...Object.keys(raw).filter(isTextBlock)]) {
    const s = asRecord(raw[b]);
    const settings: BlockSettings = {};
    if (hasTitle(b) && typeof s.title === "string" && s.title.trim())
      settings.title = s.title.trim().slice(0, MAX_TITLE);
    if (isTextBlock(b) && typeof s.content === "string" && s.content.trim())
      settings.content = s.content.slice(0, MAX_CONTENT);
    for (const f of fieldsFor(b)) {
      const value = s[f.key];
      if (typeof value === "string" && f.options.some((x) => x.value === value))
        settings[f.key] = value;
    }
    if (Object.keys(settings).length) out[b] = settings;
  }
  return out;
}

/** Bản lưu đầu tiên ("layout" + "zones" / "sidebarSections") → đầu trang + cột */
function legacyLayout(
  v: Record<string, unknown>
): Pick<BuilderOptions, "header" | "columns" | "hidden"> {
  const layout = oneOf(
    v.layout,
    ["sidebar-left", "sidebar-right", "header-band", "single"] as const,
    "sidebar-left"
  );
  const sidebar = layout === "sidebar-left" || layout === "sidebar-right";
  let aside: BlockId[];
  let main: BlockId[];
  let hidden: BlockId[];
  if (v.zones && typeof v.zones === "object") {
    const z = asRecord(v.zones);
    [aside, main, hidden] = [
      toBlocks(z.aside),
      toBlocks(z.main),
      toBlocks(z.hidden),
    ];
  } else {
    const side = sidebar ? toBlocks(v.sidebarSections) : [];
    const noAvatar = v.avatar === "none";
    aside = [
      ...PROFILE_BLOCKS.filter((b) => !(noAvatar && b === "avatar")),
      ...side,
    ];
    main = SECTION_BLOCKS.filter((b) => !side.includes(b));
    hidden = noAvatar ? ["avatar"] : [];
  }
  const sideCol: BuilderColumn = {
    id: "c1",
    width: "narrow",
    fill: v.sidebarTone === "light" ? "light" : "filled",
    blocks: aside,
  };
  const mainCol: BuilderColumn = {
    id: "c2",
    width: "wide",
    fill: "white",
    blocks: main,
  };
  return sidebar
    ? {
        header: { enabled: false, fill: "filled", blocks: [] },
        columns:
          layout === "sidebar-right" ? [mainCol, sideCol] : [sideCol, mainCol],
        hidden,
      }
    : {
        header: {
          enabled: true,
          fill: layout === "header-band" ? "filled" : "white",
          blocks: aside,
        },
        columns: [{ id: "c1", width: "normal", fill: "white", blocks: main }],
        hidden,
      };
}

/** Sửa cấu trúc cho hợp lệ: id cột, số cột, thành phần lạ / trùng / thiếu / đặt sai chỗ */
function normalize(o: BuilderOptions): BuilderOptions {
  const seen = new Set<BlockId>();
  const keep = (blocks: BlockId[]) =>
    blocks.filter((b) => {
      if (seen.has(b)) return false;
      seen.add(b);
      return true;
    });

  const header: BuilderHeader = {
    ...o.header,
    blocks: o.header.enabled ? keep(o.header.blocks) : [],
  };
  const used = new Set<string>();
  const raw = o.columns.slice(0, MAX_COLUMNS);
  const nextId = idMaker(raw.filter((c) => COLUMN_ID.test(c.id)));
  const columns = raw.map((c) => {
    const id = COLUMN_ID.test(c.id) && !used.has(c.id) ? c.id : nextId();
    used.add(id);
    return { ...c, id, blocks: keep(c.blocks) };
  });
  // đầu trang đang tắt mà còn thành phần → trả về đầu cột thứ nhất
  if (!o.header.enabled)
    columns[0].blocks = [...keep(o.header.blocks), ...columns[0].blocks];
  const hidden = keep(o.hidden.filter((b) => canPlace(b, HIDDEN_ZONE)));

  // thành phần còn thiếu: thông tin cá nhân lên đầu trang (hoặc đầu cột thứ nhất), mục nội dung vào cột chính
  const missing = ALL_BLOCKS.filter((b) => !seen.has(b));
  const profile = missing.filter(isProfileBlock);
  if (header.enabled) header.blocks.push(...profile);
  else columns[0].blocks.unshift(...profile);
  // mẫu lưu trước khi có "Giới thiệu bản thân": đặt ngay trên Mục tiêu (nếu có), không thì đầu cột chính
  const sections = missing.filter((b) => !isProfileBlock(b));
  if (sections.includes("summary")) {
    const col =
      columns.find((c) => c.blocks.includes("objective")) ??
      mainColumn(columns);
    const objective = col.blocks.indexOf("objective");
    const firstSection = col.blocks.findIndex((b) => !isProfileBlock(b));
    const at =
      objective >= 0
        ? objective
        : firstSection >= 0
        ? firstSection
        : col.blocks.length;
    col.blocks.splice(at, 0, "summary");
  }
  mainColumn(columns).blocks.push(...sections.filter((b) => b !== "summary"));
  // bỏ cài đặt của mục tùy chỉnh không còn nằm ở vùng nào
  const blocks = Object.fromEntries(
    Object.entries(o.blocks).filter(
      ([k]) => !isTextBlock(k) || seen.has(k)
    )
  );
  return { ...o, header, columns, hidden, blocks };
}

/** Đọc cấu trúc đã lưu (có thể thiếu khóa / sai kiểu / bản cũ) → luôn trả bản đầy đủ, hợp lệ */
export function readBuilder(value: unknown): BuilderOptions | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  let layout: Pick<BuilderOptions, "header" | "columns" | "hidden">;

  if (Array.isArray(v.columns)) {
    layout = {
      header: readHeader(v.header),
      columns: readColumns(v.columns),
      hidden: toBlocks(v.hidden),
    };
  } else if (Array.isArray(v.pages) && v.pages.length) {
    // bản có nhiều trang tự đặt: gộp về một bố cục. Trang sau cùng số cột thì nối vào cột tương ứng,
    // khác số cột thì dồn vào cột chính
    const pages = v.pages.map(asRecord);
    const header = readHeader(pages[0].header);
    const columns = readColumns(pages[0].columns);
    for (const p of pages.slice(1)) {
      const h = readHeader(p.header);
      (header.enabled ? header.blocks : columns[0].blocks).push(...h.blocks);
      const cols = readColumns(p.columns);
      const sameShape = cols.length === columns.length;
      cols.forEach((c, j) =>
        (sameShape ? columns[j] : mainColumn(columns)).blocks.push(...c.blocks)
      );
    }
    layout = { header, columns, hidden: toBlocks(v.hidden) };
  } else {
    layout = legacyLayout(v);
  }

  const blocks = readBlockSettings(v.blocks);
  // kiểu ảnh / kỹ năng trước đây chọn chung cho cả mẫu
  if (
    !blocks.avatar?.shape &&
    typeof v.avatar === "string" &&
    ["circle", "rounded", "square"].includes(v.avatar)
  )
    blocks.avatar = { ...blocks.avatar, shape: v.avatar };
  if (!blocks.skills?.layout && v.skills === "tags")
    blocks.skills = { ...blocks.skills, layout: "tags" };

  return normalize({
    ...layout,
    blocks,
    heading: oneOf(v.heading, HEADINGS, DEFAULT_BUILDER.heading),
    density: oneOf(v.density, DENSITIES, DEFAULT_BUILDER.density),
    align: oneOf(v.align, ALIGNS, DEFAULT_BUILDER.align),
  });
}

/* ---------------------------------- HTML ---------------------------------- */

const indent = (text: string, spaces: number) =>
  text
    .split("\n")
    .map((l) => (l.trim() ? " ".repeat(spaces) + l : l))
    .join("\n");

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "{": "&#123;",
  "}": "&#125;",
};
/** Chữ admin tự gõ: thoát HTML và dấu ngoặc nhọn để Handlebars không hiểu nhầm */
const escapeText = (s: string) => s.replace(/[&<>"{}]/g, (c) => ENTITIES[c]);

/** Danh sách mục có thời gian (kinh nghiệm, dự án, học vấn) */
const entries = (o: BuilderOptions, block: SectionBlock, body: string) => {
  const cls = [
    "entries",
    block === "experience" && getSetting(o, block, "style") === "timeline"
      ? "entries--timeline"
      : "",
    getSetting(o, block, "dates") === "below" ? "dates-below" : "",
  ].filter(Boolean);
  return `<div class="${cls.join(" ")}">\n${indent(body, 2)}\n</div>`;
};

/** Nội dung của từng loại mục (đặt trong vòng lặp {{#each sections}}) */
const SECTION_HTML: Record<SectionBlock, (o: BuilderOptions) => string> = {
  summary: () =>
    `<p class="pre">{{cvEdit "personal.summary" multiline=true}}</p>`,
  objective: () => `<p class="pre">{{cvEdit "objective" multiline=true}}</p>`,
  achievements: () => `<div class="stats">
  {{#if @root.achievements.revenueBillion}}<div><b>{{@root.achievements.revenueBillion}} tỷ</b><span>Doanh số</span></div>{{/if}}
  {{#if @root.achievements.projectCount}}<div><b>{{@root.achievements.projectCount}}</b><span>Dự án</span></div>{{/if}}
  {{#if @root.achievements.closeRate}}<div><b>{{@root.achievements.closeRate}}%</b><span>Tỷ lệ chốt</span></div>{{/if}}
</div>`,
  experience: (o) =>
    entries(
      o,
      "experience",
      `{{#each @root.experience}}
  <div class="item">
    <div class="item-head"><b>{{cvEdit "position"}}</b><span class="muted">{{period}}</span></div>
    <p class="accent">{{cvEdit "company"}}</p>
    {{#if bulletItems.length}}<ul class="bullets">{{#each bulletItems}}<li>{{cvEdit "text" multiline=true}}</li>{{/each}}</ul>{{/if}}
  </div>
{{/each}}`
    ),
  projects: (o) =>
    entries(
      o,
      "projects",
      `{{#each @root.projects}}
  <div class="item">
    <div class="item-head"><b>{{cvEdit "name"}}</b><span class="muted">{{period}}</span></div>
    {{#if role}}<p class="accent">{{cvEdit "role"}}</p>{{/if}}
    {{#if description}}<p class="pre">{{cvEdit "description" multiline=true}}</p>{{/if}}
  </div>
{{/each}}`
    ),
  education: (o) =>
    entries(
      o,
      "education",
      `{{#each @root.education}}
  <div class="item">
    <div class="item-head"><b>{{cvEdit "school"}}</b><span class="muted">{{period}}</span></div>
    {{#if major}}<p>{{cvEdit "major"}}</p>{{/if}}
  </div>
{{/each}}`
    ),
  skills: (o) => {
    const layout = getSetting(o, "skills", "layout");
    return layout === "tags"
      ? `<div class="tags">{{#each @root.skills}}<span>{{cvEdit "name"}}</span>{{/each}}</div>`
      : `<ul class="bullets${
          layout === "two-col" ? " bullets--2col" : ""
        }">{{#each @root.skills}}<li>{{cvEdit "name"}}</li>{{/each}}</ul>`;
  },
  certificates: () => `{{#each @root.certificates}}
  <p class="item"><b>{{cvEdit "name"}}</b>{{#if issuer}} <span class="muted">· {{cvEdit "issuer"}}</span>{{/if}}{{#if year}} <span class="muted">· {{cvEdit "year"}}</span>{{/if}}</p>
{{/each}}`,
  languages: () => `{{#each @root.languages}}
  <p class="lang"><b>{{cvEdit "name"}}</b><span class="muted">{{cvEdit "level"}}</span></p>
{{/each}}`,
  references: (o) => `<div class="refs${
    getSetting(o, "references", "layout") === "one" ? " refs--one" : ""
  }">
  {{#each @root.references}}
    <div class="item">
      <b>{{cvEdit "name"}}</b>
      <p>{{cvEdit "position"}}{{#if (and position company)}} · {{/if}}{{cvEdit "company"}}</p>
      <p class="muted">{{cvEdit "phone"}}{{#if (and phone email)}} · {{/if}}{{cvEdit "email"}}</p>
    </div>
  {{/each}}
</div>`,
  custom: () =>
    `{{#with custom}}<p class="pre">{{cvEdit "content" multiline=true}}</p>{{/with}}`,
};

/** Các mục liền nhau trong một vùng: lặp theo thứ tự ứng viên sắp xếp, chỉ lấy mục thuộc nhóm này */
function sectionsHtml(keys: SectionBlock[], o: BuilderOptions) {
  const body = keys
    .map((k) => `{{#if is.${k}}}\n${indent(SECTION_HTML[k](o), 2)}\n{{/if}}`)
    .join("\n");
  // tiêu đề admin đặt riêng thay cho tên mặc định của mục
  const renamed = keys.filter((k) => getTitle(o, k));
  const title = renamed.length
    ? `${renamed
        .map(
          (k, i) =>
            `{{${i ? "else if" : "#if"} is.${k}}}${escapeText(getTitle(o, k))}`
        )
        .join("")}{{else}}{{title}}{{/if}}`
    : "{{title}}";
  return `{{#each sections}}
{{#if (or ${keys.map((k) => `is.${k}`).join(" ")})}}
  <section class="section">
    <h2 class="heading">${title}</h2>
${indent(body, 4)}
  </section>
{{/if}}
{{/each}}`;
}

/** header: đầu trang; narrow: cột hẹp; wide: cột vừa / rộng */
type Place = "header" | "narrow" | "wide";

function profileHtml(b: ProfileBlock, place: Place, o: BuilderOptions): string {
  switch (b) {
    case "avatar":
      return `{{#if personal.avatarUrl}}
  <img class="avatar" src="{{personal.avatarUrl}}" alt="{{personal.fullName}}" />
{{else}}
  <div class="avatar avatar--text">{{personal.initials}}</div>
{{/if}}`;
    case "identity":
      return `<div class="identity">
  <h1 class="name">{{#if personal.fullName}}{{cvEdit "personal.fullName"}}{{else}}Họ và tên{{/if}}</h1>
  {{#if personal.title}}<p class="title">{{cvEdit "personal.title"}}</p>{{/if}}
</div>`;
    case "contacts": {
      const layout = getSetting(o, "contacts", "layout");
      const list =
        layout === "list" || (layout === "auto" && place === "narrow");
      return list
        ? `{{#if contacts.length}}
  <section class="section">
    <h2 class="heading">${escapeText(getTitle(o, "contacts") || "Liên hệ")}</h2>
    <ul class="contacts--list">{{#each contacts}}<li><span class="label">{{label}}</span>{{cvEdit "value"}}</li>{{/each}}</ul>
  </section>
{{/if}}`
        : `{{#if contacts.length}}<p class="contacts--inline">{{#each contacts}}<span>{{cvEdit "value"}}</span>{{/each}}</p>{{/if}}`;
    }
  }
}

/** Mục tùy chỉnh admin tự viết: hiện giống nhau trên mọi CV dùng mẫu */
function textHtml(b: TextBlockId, o: BuilderOptions): string {
  const title = getTitle(o, b);
  const content = (o.blocks[b]?.content ?? "").trim();
  if (!title && !content) return "";
  const lines = content.split("\n").map((l) => escapeText(l.trim()));
  // xuống dòng bằng <br /> để thụt lề của mã HTML không lọt vào nội dung
  const body =
    getSetting(o, b, "layout") === "bullets"
      ? `<ul class="bullets">${lines
          .filter(Boolean)
          .map((l) => `<li>${l}</li>`)
          .join("")}</ul>`
      : `<p>${lines.join("<br />")}</p>`;
  return `<section class="section">
${title ? `  <h2 class="heading">${escapeText(title)}</h2>\n` : ""}${
    content ? `  ${body}\n` : ""
  }</section>`;
}

/** Nội dung một vùng theo đúng thứ tự kéo thả; các mục liền nhau gộp thành một vòng lặp */
function zoneHtml(blocks: BlockId[], place: Place, o: BuilderOptions): string {
  const parts: string[] = [];
  let run: SectionBlock[] = [];
  const flush = () => {
    if (run.length) parts.push(sectionsHtml(run, o));
    run = [];
  };
  for (const b of blocks) {
    if (isProfileBlock(b)) {
      flush();
      parts.push(profileHtml(b, place, o));
    } else if (isTextBlock(b)) {
      flush();
      const html = textHtml(b, o);
      if (html) parts.push(html);
    } else {
      run.push(b);
    }
  }
  flush();
  return parts.join("\n");
}

export function generateHtml(o: BuilderOptions): string {
  const header = o.header.enabled
    ? `<header class="header fill-${o.header.fill}">\n${indent(
        zoneHtml(o.header.blocks, "header", o),
        2
      )}\n</header>\n`
    : "";
  const cols = o.columns
    .map(
      (c) =>
        `<div class="col col--${c.width} fill-${c.fill}">\n${indent(
          zoneHtml(c.blocks, c.width === "narrow" ? "narrow" : "wide", o),
          2
        )}\n</div>`
    )
    .join("\n");
  // data-cv-page: trang tự kéo dài tới bội số trang A4 → màu nền cột phủ hết cả trang tràn
  return `<div class="cv" data-cv-page data-cv-builder>
${indent(`${header}<div class="cols">\n${indent(cols, 2)}\n</div>`, 2)}
</div>`;
}

/* ----------------------------------- CSS ---------------------------------- */

const DENSITY = {
  compact: { gap: 12, pad: 24 },
  normal: { gap: 18, pad: 32 },
  airy: { gap: 26, pad: 42 },
};
const AVATAR_RADIUS: Record<string, string> = {
  circle: "50%",
  rounded: "14px",
  square: "0",
};
const AVATAR_SIZE: Record<string, number> = { sm: 72, md: 96, lg: 124 };
const FILL_BG: Record<Fill, string> = {
  white: "#fff",
  filled: "var(--cv-color)",
  light: "color-mix(in srgb, var(--cv-color) 9%, #fff)",
};

const HEADING_CSS: Record<BuilderHeading, string> = {
  underline: `.heading { padding-bottom: 4px; border-bottom: 2px solid var(--cv-color); color: var(--cv-color); }`,
  bar: `.heading { padding: 4px 10px; border-radius: 4px; background: var(--cv-color); color: #fff; }
.fill-filled .heading { background: rgba(255,255,255,.18); }`,
  "left-border": `.heading { padding-left: 10px; border-left: 4px solid var(--cv-color); color: var(--cv-color); }`,
  plain: `.heading { color: var(--cv-color); letter-spacing: .15em; }`,
};

/** Độ rộng + nền các cột; nền vẽ trên cả khung cột nên kéo dài hết trang, kể cả trang tràn */
function columnsCss(o: BuilderOptions): string {
  const total = o.columns.reduce((s, c) => s + WIDTH_FR[c.width], 0);
  let acc = 0;
  const stops = o.columns.map((c) => {
    const from = (acc / total) * 100;
    acc += WIDTH_FR[c.width];
    return `${FILL_BG[c.fill]} ${from.toFixed(2)}% ${(
      (acc / total) *
      100
    ).toFixed(2)}%`;
  });
  const bg =
    o.columns.length === 1
      ? FILL_BG[o.columns[0].fill]
      : `linear-gradient(to right, ${stops.join(", ")})`;
  return `.cols { grid-template-columns: ${o.columns
    .map((c) => `${WIDTH_FR[c.width]}fr`)
    .join(" ")}; background: ${bg}; }${
    o.columns.length === 1 ? "\n.col { padding-inline: 40px; }" : ""
  }`;
}

/** Căn trái + có ảnh ở đầu trang: ảnh một bên, chữ một bên (ảnh đứng sau trong danh sách → nằm bên phải) */
function headerCss(o: BuilderOptions): string {
  const blocks = o.header.blocks;
  const textCount = blocks.filter((b) => b !== "avatar").length;
  const avatarAt = blocks.indexOf("avatar");
  if (
    !o.header.enabled ||
    o.align !== "left" ||
    avatarAt < 0 ||
    textCount === 0
  )
    return "";
  const end = avatarAt > 0;
  return `.header { display: grid; grid-template-columns: ${
    end ? "1fr auto" : "auto 1fr"
  }; column-gap: 24px; align-items: center; }
.header .avatar { grid-column: ${
    end ? 2 : 1
  }; grid-row: 1 / span ${textCount}; }
.header > :not(.avatar) { grid-column: ${end ? 1 : 2}; }`;
}

export function generateCss(o: BuilderOptions): string {
  const d = DENSITY[o.density];
  const center = o.align === "center";
  const avatar = AVATAR_SIZE[getSetting(o, "avatar", "size")];
  const bigName = getSetting(o, "identity", "size") === "lg";
  return `/* Tạo tự động từ "Thiết kế nhanh" */
.cv { display: flex; flex-direction: column; min-height: calc(297mm - 0.5mm); color: #1f2937; background: #fff; }
.cols { flex: 1; display: grid; align-items: start; }
/* clone: phần tràn sang trang giấy sau vẫn có lề trên */
.col { min-width: 0; padding: ${
    d.pad
  }px 24px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.col--narrow { padding-inline: 20px; }
.header { display: flex; flex-direction: column; gap: 6px; padding: ${
    d.pad
  }px 40px ${Math.round(d.pad * 0.7)}px;${
    center ? " align-items: center; text-align: center;" : ""
  } }
.header + .cols .col { padding-top: ${Math.round(d.pad * 0.75)}px; }
${columnsCss(o)}
${headerCss(o)}

/* Nền */
.fill-filled { color: #fff; }
.header.fill-filled { background: var(--cv-color); }
.header.fill-light { background: ${FILL_BG.light}; }
.header.fill-white { border-bottom: 1px solid #e5e7eb; }
.fill-white .name, .fill-light .name { color: var(--cv-color); }
.fill-filled .muted, .fill-filled .accent { color: inherit; opacity: .8; }
.fill-filled .avatar { border: 4px solid rgba(255,255,255,.3); }
.fill-filled .avatar--text { background: rgba(255,255,255,.15); color: #fff; }
.fill-filled .tags > span { background: rgba(255,255,255,.18); color: #fff; }
.fill-filled .stats div { background: rgba(255,255,255,.12); }
.fill-filled .stats b, .fill-filled .stats span { color: inherit; }

/* Khoảng cách giữa các thành phần trong cột */
.col > * + * { margin-top: ${d.gap}px; }
.col > .avatar + .identity { margin-top: 12px; }
.col > .identity + .contacts--inline { margin-top: 6px; }

.avatar { display: block; flex-shrink: 0; width: ${avatar}px; height: ${avatar}px; border-radius: ${
    AVATAR_RADIUS[getSetting(o, "avatar", "shape")]
  }; object-fit: cover; }
.avatar--text { display: flex; align-items: center; justify-content: center; font-size: ${(
    avatar / 48
  ).toFixed(
    2
  )}em; font-weight: 700; background: color-mix(in srgb, var(--cv-color) 12%, #fff); color: var(--cv-color); }
.name { font-size: ${
    bigName ? 2.3 : 1.8
  }em; font-weight: 700; line-height: 1.2; text-transform: uppercase; }
.col--narrow .name { font-size: ${bigName ? 1.8 : 1.5}em; }
.title { margin-top: 2px; font-size: .9em; letter-spacing: .05em; text-transform: uppercase; opacity: .8; }
.contacts--inline { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: .82em; opacity: .85; }
.contacts--list { font-size: .85em; word-break: break-word; }
.contacts--list li + li { margin-top: 6px; }
.contacts--list .label { display: block; font-size: .8em; opacity: .7; }
${
  center
    ? `.identity { text-align: center; }
.contacts--inline { justify-content: center; }
.col > .avatar { margin-inline: auto; }
`
    : ""
}
.heading { margin-bottom: 8px; font-size: 1em; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
${HEADING_CSS[o.heading]}
.fill-filled .heading { color: #fff; border-color: rgba(255,255,255,.55); }
.col--narrow .heading { font-size: .85em; }

.item { break-inside: avoid; }
.item + .item { margin-top: ${Math.round(d.gap * 0.6)}px; }
.item-head { display: flex; flex-wrap: wrap; justify-content: space-between; column-gap: 12px; }
.dates-below .item-head { flex-direction: column; }
.entries--timeline { margin-left: 4px; padding-left: 14px; border-left: 2px solid var(--cv-color); }
.entries--timeline .item { position: relative; }
.entries--timeline .item::before { content: ""; position: absolute; left: -20px; top: .4em; width: 10px; height: 10px; border-radius: 50%; background: var(--cv-color); box-shadow: 0 0 0 2px #fff; }
.fill-filled .entries--timeline { border-color: rgba(255,255,255,.6); }
.fill-filled .entries--timeline .item::before { background: #fff; box-shadow: none; }
.muted { color: #6b7280; font-size: .85em; }
.accent { color: var(--cv-color); font-weight: 500; font-size: .92em; }
.pre { white-space: pre-line; }
.bullets { margin-top: 4px; padding-left: 18px; list-style: disc; }
.bullets li + li { margin-top: 2px; }
.bullets--2col { columns: 2; column-gap: 24px; }
.bullets--2col li { break-inside: avoid; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tags > span { padding: 2px 10px; border-radius: 999px; font-size: .85em; background: color-mix(in srgb, var(--cv-color) 12%, #fff); color: var(--cv-color); }
.lang { display: flex; justify-content: space-between; gap: 8px; }
.lang + .lang { margin-top: 4px; }
.refs { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.refs--one { grid-template-columns: 1fr; }
.refs .item + .item { margin-top: 0; }

.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px; }
.stats div { padding: 8px; border-radius: 8px; text-align: center; background: color-mix(in srgb, var(--cv-color) 8%, #fff); }
.stats b { display: block; color: var(--cv-color); font-size: 1.3em; }
.stats span { font-size: .75em; color: #6b7280; }`;
}

export const generateTemplate = (o: BuilderOptions) => ({
  htmlContent: generateHtml(o),
  cssContent: generateCss(o),
});

/**
 * Mẫu tạo bằng "Thiết kế nhanh" (có defaultConfig.builder): dựng lại HTML/CSS từ cấu trúc đã lưu
 * để luôn dùng bản sinh mới nhất (vd bấm sửa chữ trên CV), không cần admin lưu lại mẫu.
 * Mẫu viết code tay không lưu builder nên giữ nguyên.
 */
export function resolveBuilderSource<
  T extends {
    htmlContent: string;
    cssContent: string | null;
    defaultConfig: Record<string, unknown> | null;
  }
>(t: T): T {
  if (!t.defaultConfig?.builder || !t.htmlContent.includes("data-cv-page"))
    return t;
  const b = readBuilder(t.defaultConfig.builder);
  return b ? { ...t, ...generateTemplate(b) } : t;
}
