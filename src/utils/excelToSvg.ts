import type { Cell, Fill, Worksheet } from "exceljs";

// Vẽ lại sheet đầu tiên của file Excel thành ảnh vector SVG giống khi xem trong Excel:
// ô gộp, màu nền, viền, font, căn lề, xuống dòng, độ rộng cột / chiều cao hàng và định dạng số.
// Chữ và nét vẽ là vector nên phóng to bao nhiêu cũng nét. Chạy ở trình duyệt (cần canvas để đo chữ).
// Chưa hỗ trợ: hình ảnh / shape chèn vào sheet, định dạng có điều kiện, chữ xoay.

const DEFAULT_COL_WIDTH = 8.43; // ký tự, = 64px
const DEFAULT_ROW_PT = 15;
const DEFAULT_FONT = { name: "Calibri", size: 11 };
const PAD = 3; // khoảng cách chữ tới mép ô (px), như Excel
const TARGET_LONG_SIDE = 3000; // kích thước khai báo của SVG, khớp hệ toạ độ mặt bằng PDF

type XColor = { argb?: string; theme?: number; tint?: number; indexed?: number };
type Rect = { x: number; y: number; w: number; h: number };
type Edge = { width: number; dash: string; color: string };

// Bảng màu "indexed" mặc định của Excel (64 = màu chữ hệ thống, 65 = nền hệ thống)
const INDEXED = (
  "000000 FFFFFF FF0000 00FF00 0000FF FFFF00 FF00FF 00FFFF 000000 FFFFFF FF0000 00FF00 0000FF FFFF00 FF00FF 00FFFF " +
  "800000 008000 000080 808000 800080 008080 C0C0C0 808080 9999FF 993366 FFFFCC CCFFFF 660066 FF8080 0066CC CCCCFF " +
  "000080 FF00FF FFFF00 00FFFF 800080 800000 008080 0000FF 00CCFF CCFFFF CCFFCC FFFF99 99CCFF FF99CC CC99FF FFCC99 " +
  "3366FF 33CCCC 99CC00 FFCC00 FF9900 FF6600 666699 969696 003366 339966 003300 333300 993300 993366 333399 333333 " +
  "000000 FFFFFF"
).split(" ");

// Màu theme Office mặc định; thứ tự theo chỉ số theme của Excel (0 = nền sáng, 1 = chữ tối...)
const DEFAULT_THEME = ["FFFFFF", "000000", "E7E6E6", "44546A", "4472C4", "ED7D31", "A5A5A5", "FFC000", "5B9BD5", "70AD47", "0563C1", "954F72"];
const THEME_TAGS = ["lt1", "dk1", "lt2", "dk2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

const BORDER_STYLES: Record<string, { width: number; dash: string }> = {
  hair: { width: 0.5, dash: "" },
  thin: { width: 1, dash: "" },
  medium: { width: 2, dash: "" },
  thick: { width: 3, dash: "" },
  double: { width: 3, dash: "" },
  dotted: { width: 1, dash: "1 1" },
  dashed: { width: 1, dash: "3 2" },
  dashDot: { width: 1, dash: "3 1 1 1" },
  dashDotDot: { width: 1, dash: "3 1 1 1 1 1" },
  mediumDashed: { width: 2, dash: "4 2" },
  mediumDashDot: { width: 2, dash: "4 2 1 2" },
  mediumDashDotDot: { width: 2, dash: "4 2 1 2 1 2" },
  slantDashDot: { width: 2, dash: "4 1 2 1" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const r2 = (n: number) => Math.round(n * 100) / 100;

// ================= MÀU =================

function readTheme(workbook: unknown): string[] {
  const xml = (workbook as { _themes?: Record<string, string> })._themes?.theme1;
  if (!xml || typeof DOMParser === "undefined") return DEFAULT_THEME;
  try {
    const scheme = new DOMParser().parseFromString(xml, "application/xml").getElementsByTagNameNS("*", "clrScheme")[0];
    if (!scheme) return DEFAULT_THEME;
    return THEME_TAGS.map((tag, i) => {
      const color = scheme.getElementsByTagNameNS("*", tag)[0]?.firstElementChild;
      return color?.getAttribute("lastClr") ?? color?.getAttribute("val") ?? DEFAULT_THEME[i];
    });
  } catch {
    return DEFAULT_THEME; // theme hỏng thì dùng màu Office mặc định
  }
}

// Excel làm sáng / tối màu theme bằng tint (-1..1) trên độ sáng HSL
function applyTint(hex: string, tint: number): string {
  let r = parseInt(hex.slice(0, 2), 16) / 255;
  let g = parseInt(hex.slice(2, 4), 16) / 255;
  let b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  l = tint < 0 ? l * (1 + tint) : l * (1 - tint) + tint;
  const hue = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue(p, q, h + 1 / 3);
    g = hue(p, q, h);
    b = hue(p, q, h - 1 / 3);
  }
  return [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function makeColorOf(theme: string[]) {
  return (c: XColor | undefined): string | null => {
    if (!c) return null;
    let hex: string | undefined;
    if (c.argb) hex = c.argb.length === 8 ? c.argb.slice(2) : c.argb;
    else if (c.theme !== undefined) hex = theme[c.theme];
    else if (c.indexed !== undefined) hex = INDEXED[c.indexed];
    if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return null;
    if (c.tint) hex = applyTint(hex, c.tint);
    return `#${hex.toUpperCase()}`;
  };
}

// ================= GIÁ TRỊ Ô =================

function generalNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e11) return String(n);
  return String(parseFloat(n.toPrecision(10)));
}

function splitSections(fmt: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of fmt) {
    if (ch === '"') quoted = !quoted;
    if (ch === ";" && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function formatDate(d: Date, fmt: string): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  return /h/i.test(fmt) ? `${date} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}` : date;
}

// Định dạng số theo numFmt của Excel (các dạng thường gặp: 0, 0.0, #,##0.00, 0%, 0.00" tỷ", ngày tháng)
function formatNumber(n: number, fmt: string | undefined): string {
  if (!fmt || /^general$/i.test(fmt.trim())) return generalNumber(n);
  const sections = splitSections(fmt);
  let section = sections[0];
  let value = n;
  if (n < 0 && sections[1] !== undefined && sections[1] !== "") {
    section = sections[1];
    value = Math.abs(n);
  } else if (n === 0 && sections[2] !== undefined && sections[2] !== "") {
    section = sections[2];
  }

  let prefix = "";
  let suffix = "";
  let pattern = "";
  let percent = false;
  let isDate = false;
  const lit = (s: string) => {
    if (pattern) suffix += s;
    else prefix += s;
  };
  for (let i = 0; i < section.length; i++) {
    const ch = section[i];
    if (ch === '"') {
      const end = section.indexOf('"', i + 1);
      lit(section.slice(i + 1, end < 0 ? undefined : end));
      i = end < 0 ? section.length : end;
    } else if (ch === "\\") {
      lit(section[i + 1] ?? "");
      i++;
    } else if (ch === "[") {
      const end = section.indexOf("]", i);
      i = end < 0 ? section.length : end;
    } else if (ch === "_") {
      lit(" ");
      i++;
    } else if (ch === "*") {
      i++;
    } else if ("0#?.,".includes(ch)) {
      pattern += ch;
    } else if (ch === "%") {
      percent = true;
      lit("%");
    } else if (/[dmyhs]/i.test(ch) && !pattern) {
      isDate = true;
    } else if (ch === "@") {
      lit(generalNumber(n));
    } else {
      lit(ch);
    }
  }
  if (isDate && !/[0#?]/.test(pattern)) {
    return formatDate(new Date(Math.round((n - 25569) * 86400000)), section);
  }
  if (!/[0#?]/.test(pattern)) return prefix + suffix;

  // Dấu phẩy ở cuối mẫu số chia cho 1000 mỗi dấu (vd 0,, = triệu)
  const trailing = pattern.match(/,+$/)?.[0].length ?? 0;
  if (trailing) value /= 1000 ** trailing;
  if (percent) value *= 100;
  const [intPart, decPart = ""] = pattern.replace(/,+$/, "").split(".");
  const maxDec = (decPart.match(/[0#?]/g) ?? []).length;
  const minDec = (decPart.match(/0/g) ?? []).length;
  const minInt = (intPart.match(/0/g) ?? []).length;
  const grouping = /[0#?],[0#?]/.test(intPart);
  const sign = value < 0 ? "-" : "";
  const num = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
    minimumIntegerDigits: Math.max(1, minInt),
    useGrouping: grouping,
  });
  // "#" không có số 0 bắt buộc: 0.5 hiện ".5" như Excel
  const shown = minInt === 0 && num.startsWith("0.") ? num.slice(1) : num;
  return sign + prefix + shown + suffix;
}

type CellValue = { text: string; kind: "number" | "bool" | "text" };

function cellValue(cell: Cell): CellValue {
  let v: unknown = cell.value;
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const o = v as { richText?: { text: string }[]; result?: unknown; text?: unknown; error?: string };
    if (o.richText) return { text: o.richText.map((r) => r.text).join(""), kind: "text" };
    if ("result" in o) v = o.result;
    else if ("text" in o) v = o.text;
    else if (o.error) return { text: o.error, kind: "text" };
    if (v && typeof v === "object" && !(v instanceof Date)) {
      const err = (v as { error?: string }).error;
      return { text: err ?? "", kind: "text" };
    }
  }
  if (v === null || v === undefined) return { text: "", kind: "text" };
  if (v instanceof Date) return { text: formatDate(v, cell.numFmt ?? ""), kind: "number" };
  if (typeof v === "number") return { text: formatNumber(v, cell.numFmt), kind: "number" };
  if (typeof v === "boolean") return { text: v ? "TRUE" : "FALSE", kind: "bool" };
  return { text: String(v), kind: "text" };
}

// ================= VÙNG CẦN VẼ =================

const colIndex = (letters: string) => [...letters.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

function parseRef(ref: string): { top: number; left: number; bottom: number; right: number } | null {
  const m = ref.replace(/\$/g, "").replace(/^.*!/, "").match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i);
  if (!m) return null;
  const a = { c: colIndex(m[1]), r: Number(m[2]) };
  const b = m[3] ? { c: colIndex(m[3]), r: Number(m[4]) } : a;
  return { top: Math.min(a.r, b.r), left: Math.min(a.c, b.c), bottom: Math.max(a.r, b.r), right: Math.max(a.c, b.c) };
}

// Vùng in nếu sheet có đặt, không thì vùng có nội dung / màu nền / viền
function drawRange(ws: Worksheet, hasContent: (cell: Cell) => boolean) {
  const printArea = ws.pageSetup?.printArea;
  if (printArea) {
    const range = parseRef(printArea.split(",")[0]);
    if (range) return range;
  }
  let top = Infinity;
  let left = Infinity;
  let bottom = 0;
  let right = 0;
  for (let r = 1; r <= ws.rowCount; r++) {
    for (let c = 1; c <= ws.columnCount; c++) {
      if (!hasContent(ws.getCell(r, c))) continue;
      top = Math.min(top, r);
      left = Math.min(left, c);
      bottom = Math.max(bottom, r);
      right = Math.max(right, c);
    }
  }
  if (bottom === 0) throw new Error("Sheet đầu tiên của file Excel đang trống");
  return { top, left, bottom, right };
}

// ================= VẼ =================

export async function excelToSvg(buffer: ArrayBuffer): Promise<{ svg: string; width: number; height: number; sheetName: string }> {
  const mod = (await import("exceljs")) as unknown as { default?: typeof import("exceljs") } & typeof import("exceljs");
  const ExcelJS = mod.default ?? mod;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const ws = workbook.worksheets.find((w) => w.state === "visible") ?? workbook.worksheets[0];
  if (!ws) throw new Error("File Excel không có sheet nào");

  const colorOf = makeColorOf(readTheme(workbook));
  const fillOf = (fill: Fill | undefined): string | null => {
    if (!fill) return null;
    if (fill.type === "pattern") return fill.pattern === "none" ? null : colorOf(fill.fgColor as XColor) ?? colorOf(fill.bgColor as XColor);
    if (fill.type === "gradient") return colorOf(fill.stops?.[0]?.color as XColor);
    return null;
  };
  const hasBorder = (cell: Cell) => {
    const b = cell.border;
    return !!(b && (b.top?.style || b.bottom?.style || b.left?.style || b.right?.style));
  };
  const hasContent = (cell: Cell) => cellValue(cell).text !== "" || !!fillOf(cell.fill) || hasBorder(cell);

  const range = drawRange(ws, hasContent);
  const { top, left, bottom, right } = range;

  // Ô gộp: mỗi ô trỏ tới vùng gộp chứa nó
  type Merge = { top: number; left: number; bottom: number; right: number };
  const mergeAt = new Map<string, Merge>();
  for (const ref of (ws.model as { merges?: string[] }).merges ?? []) {
    const m = parseRef(ref);
    if (!m) continue;
    for (let r = m.top; r <= m.bottom; r++) for (let c = m.left; c <= m.right; c++) mergeAt.set(`${r},${c}`, m);
  }
  const mergeOf = (r: number, c: number) => mergeAt.get(`${r},${c}`);

  // Đo chữ bằng canvas
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");
  const fontOf = (cell: Cell) => {
    const f = cell.font ?? {};
    const name = f.name ?? DEFAULT_FONT.name;
    const generic = /times|cambria|georgia|garamond|serif|vni-times/i.test(name) && !/sans/i.test(name) ? "serif" : "sans-serif";
    const px = ((f.size ?? DEFAULT_FONT.size) * 4) / 3;
    return {
      px,
      family: `'${name.replace(/'/g, "")}', ${generic}`,
      css: `${f.italic ? "italic " : ""}${f.bold ? "bold " : ""}${px}px "${name.replace(/"/g, "")}", ${generic}`,
      bold: !!f.bold,
      italic: !!f.italic,
      underline: !!f.underline,
      strike: !!f.strike,
      color: colorOf(f.color as XColor) ?? "#000000",
    };
  };
  const measure = (text: string, css: string) => {
    ctx.font = css;
    return ctx.measureText(text).width;
  };

  // Kích thước cột / hàng (px)
  const colPx: number[] = [];
  for (let c = left; c <= right; c++) {
    const col = ws.getColumn(c);
    const width = col.width ?? ws.properties.defaultColWidth ?? DEFAULT_COL_WIDTH;
    colPx.push(col.hidden ? 0 : Math.round(width * 7 + 5));
  }
  const rowPx: number[] = [];
  for (let r = top; r <= bottom; r++) {
    const row = ws.getRow(r);
    if (row.hidden) {
      rowPx.push(0);
      continue;
    }
    if (row.height) {
      rowPx.push((row.height * 4) / 3);
      continue;
    }
    // Hàng chưa đặt chiều cao: Excel tự giãn theo cỡ chữ lớn nhất trong hàng
    let maxFont = 0;
    for (let c = left; c <= right; c++) {
      const cell = ws.getCell(r, c);
      if (cellValue(cell).text) maxFont = Math.max(maxFont, fontOf(cell).px);
    }
    rowPx.push(Math.max(((ws.properties.defaultRowHeight ?? DEFAULT_ROW_PT) * 4) / 3, maxFont * 1.25 + 2));
  }
  const xs = [0];
  colPx.forEach((w) => xs.push(xs[xs.length - 1] + w));
  const ys = [0];
  rowPx.forEach((h) => ys.push(ys[ys.length - 1] + h));
  const W = xs[xs.length - 1];
  const H = ys[ys.length - 1];
  const X = (c: number) => xs[Math.min(Math.max(c, left), right + 1) - left];
  const Y = (r: number) => ys[Math.min(Math.max(r, top), bottom + 1) - top];
  const rectOf = (t: number, l: number, b: number, rt: number): Rect => ({ x: X(l), y: Y(t), w: X(rt + 1) - X(l), h: Y(b + 1) - Y(t) });

  const fills: string[] = [];
  const texts: string[] = [];
  const clips: string[] = [];
  const hEdges = new Map<string, Edge>(); // cạnh trên của ô (r, c)
  const vEdges = new Map<string, Edge>(); // cạnh trái của ô (r, c)

  const putEdge = (map: Map<string, Edge>, key: string, side: { style?: string; color?: unknown } | undefined) => {
    if (!side?.style) return;
    const st = BORDER_STYLES[side.style] ?? BORDER_STYLES.thin;
    const edge = { width: st.width, dash: st.dash, color: colorOf(side.color as XColor) ?? "#000000" };
    const cur = map.get(key);
    if (!cur || edge.width > cur.width) map.set(key, edge);
  };

  const isEmpty = (r: number, c: number) => !mergeOf(r, c) && cellValue(ws.getCell(r, c)).text === "";

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      const cell = ws.getCell(r, c);
      const merge = mergeOf(r, c);

      // Viền: lưu theo cạnh, bỏ các cạnh nằm bên trong vùng gộp
      const b = cell.border;
      if (b) {
        if (!(merge && r > merge.top)) putEdge(hEdges, `${r},${c}`, b.top);
        if (!(merge && r < merge.bottom)) putEdge(hEdges, `${r + 1},${c}`, b.bottom);
        if (!(merge && c > merge.left)) putEdge(vEdges, `${r},${c}`, b.left);
        if (!(merge && c < merge.right)) putEdge(vEdges, `${r},${c + 1}`, b.right);
      }

      // Nền và chữ chỉ vẽ ở ô đầu của vùng gộp
      if (merge && (merge.top !== r || merge.left !== c)) continue;
      const rect = merge ? rectOf(merge.top, merge.left, Math.min(merge.bottom, bottom), Math.min(merge.right, right)) : rectOf(r, c, r, c);
      if (rect.w <= 0 || rect.h <= 0) continue;

      const fill = fillOf(cell.fill);
      if (fill) fills.push(`<rect x="${r2(rect.x)}" y="${r2(rect.y)}" width="${r2(rect.w)}" height="${r2(rect.h)}" fill="${fill}"/>`);

      const value = cellValue(cell);
      if (!value.text) continue;
      const font = fontOf(cell);
      const align = cell.alignment ?? {};
      const wrap = !!align.wrapText;
      const indent = (align.indent ?? 0) * 9;
      let horizontal: string = align.horizontal ?? (value.kind === "number" ? "right" : value.kind === "bool" ? "center" : "left");
      if (horizontal === "centerContinuous" || horizontal === "distributed") horizontal = "center";
      if (horizontal === "fill" || horizontal === "justify") horizontal = "left";
      const vertical = align.vertical === "top" ? "top" : align.vertical === "middle" || align.vertical === "distributed" || align.vertical === "justify" ? "middle" : "bottom";

      let px = font.px;
      let css = font.css;
      const avail = rect.w - 2 * PAD - indent;
      let lines: string[];
      if (wrap) {
        lines = [];
        for (const para of value.text.split(/\r?\n/)) {
          let line = "";
          for (const word of para.split(" ")) {
            const test = line ? `${line} ${word}` : word;
            if (line && measure(test, css) > avail) {
              lines.push(line);
              line = word;
            } else line = test;
          }
          lines.push(line);
        }
      } else {
        lines = [value.text.replace(/\r?\n/g, " ")];
        if (align.shrinkToFit) {
          const w = measure(lines[0], css);
          if (w > avail && w > 0) {
            px = Math.max(4, (px * avail) / w);
            css = css.replace(/[\d.]+px/, `${px}px`);
          }
        }
      }

      // Chữ dài hơn ô (không xuống dòng, không gộp): tràn sang các ô trống bên cạnh như Excel
      const textW = Math.max(...lines.map((l) => measure(l, css)));
      let clip: Rect = rect;
      if (!wrap && !merge && textW > avail) {
        let l = c;
        let rt = c;
        if (horizontal !== "right") while (rt < right && isEmpty(r, rt + 1) && X(rt + 1) - X(l) < textW + 2 * PAD + indent) rt++;
        if (horizontal !== "left") while (l > left && isEmpty(r, l - 1) && X(rt + 1) - X(l) < textW + 2 * PAD + indent) l--;
        clip = rectOf(r, l, r, rt);
      }

      const lineH = px * 1.2;
      const blockH = lines.length * lineH;
      const startY = vertical === "top" ? rect.y + 1 : vertical === "middle" ? rect.y + (rect.h - blockH) / 2 : rect.y + rect.h - blockH - 1;
      const anchor = horizontal === "right" ? "end" : horizontal === "center" ? "middle" : "start";
      const tx = horizontal === "right" ? rect.x + rect.w - PAD - indent : horizontal === "center" ? rect.x + rect.w / 2 : rect.x + PAD + indent;
      const needClip = textW > clip.w - 2 * PAD || blockH > rect.h;
      let clipAttr = "";
      if (needClip) {
        const id = `c${clips.length}`;
        clips.push(`<clipPath id="${id}"><rect x="${r2(clip.x)}" y="${r2(clip.y)}" width="${r2(clip.w)}" height="${r2(clip.h)}"/></clipPath>`);
        clipAttr = ` clip-path="url(#${id})"`;
      }
      const deco = [font.underline ? "underline" : "", font.strike ? "line-through" : ""].filter(Boolean).join(" ");
      const tspans = lines
        .map((line, i) => `<tspan x="${r2(tx)}" y="${r2(startY + i * lineH + (lineH - px) / 2 + px * 0.82)}">${esc(line)}</tspan>`)
        .join("");
      texts.push(
        `<text font-family="${esc(font.family)}" font-size="${r2(px)}"${font.bold ? ' font-weight="bold"' : ""}${font.italic ? ' font-style="italic"' : ""}` +
          `${deco ? ` text-decoration="${deco}"` : ""} fill="${font.color}" text-anchor="${anchor}"${clipAttr} xml:space="preserve">${tspans}</text>`,
      );
    }
  }

  // Gộp các cạnh liền nhau cùng kiểu thành một đường cho nhẹ
  const lines: string[] = [];
  const same = (a: Edge | undefined, b: Edge | undefined) => !!a && !!b && a.width === b.width && a.dash === b.dash && a.color === b.color;
  const stroke = (e: Edge) => `stroke="${e.color}" stroke-width="${e.width}"${e.dash ? ` stroke-dasharray="${e.dash}"` : ""}`;
  for (let r = top; r <= bottom + 1; r++) {
    for (let c = left; c <= right; c++) {
      const e = hEdges.get(`${r},${c}`);
      if (!e || same(hEdges.get(`${r},${c - 1}`), e)) continue;
      let end = c;
      while (same(hEdges.get(`${r},${end + 1}`), e)) end++;
      lines.push(`<line x1="${r2(X(c))}" y1="${r2(Y(r))}" x2="${r2(X(end + 1))}" y2="${r2(Y(r))}" ${stroke(e)}/>`);
    }
  }
  for (let c = left; c <= right + 1; c++) {
    for (let r = top; r <= bottom; r++) {
      const e = vEdges.get(`${r},${c}`);
      if (!e || same(vEdges.get(`${r - 1},${c}`), e)) continue;
      let end = r;
      while (same(vEdges.get(`${end + 1},${c}`), e)) end++;
      lines.push(`<line x1="${r2(X(c))}" y1="${r2(Y(r))}" x2="${r2(X(c))}" y2="${r2(Y(end + 1))}" ${stroke(e)}/>`);
    }
  }

  // Khai báo kích thước lớn để vẽ ở độ phân giải đủ cao; viewBox giữ toạ độ gốc (px của Excel)
  const scale = Math.min(6, Math.max(1, TARGET_LONG_SIDE / Math.max(W, H)));
  const width = Math.round(W * scale);
  const height = Math.round(H * scale);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${r2(W)} ${r2(H)}" text-rendering="geometricPrecision">` +
    `<defs>${clips.join("")}</defs>` +
    `<rect width="${r2(W)}" height="${r2(H)}" fill="#FFFFFF"/>` +
    `<g>${fills.join("")}</g>` +
    `<g>${texts.join("")}</g>` +
    `<g shape-rendering="crispEdges">${lines.join("")}</g>` +
    `</svg>`;
  return { svg, width, height, sheetName: ws.name };
}

// File Excel người dùng chọn → file SVG để tải lên như một ảnh bảng hàng
export async function excelFileToSvgFile(file: File): Promise<File> {
  const { svg } = await excelToSvg(await file.arrayBuffer());
  const name = file.name.replace(/\.[^.]+$/, "") || "bang-hang";
  return new File([svg], `${name}.svg`, { type: "image/svg+xml" });
}
