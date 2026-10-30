import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import { CV_FONTS_URL } from "../../types/job/cv.types";

/** Chiều cao trang A4 (297mm) theo px CSS */
const A4_PX = (297 / 25.4) * 96;
/** Độ nét ảnh trong PDF: 2.5 × 96dpi ≈ 240dpi, đủ nét khi in */
const SCALE = 2.5;
/** Lề trên cho phần nội dung được đẩy sang trang mới */
const PAGE_TOP_GAP = 28;
/** Tiêu đề mục nằm sát đáy trang thì đưa sang trang sau cùng nội dung của nó */
const HEADING_KEEP = 40;
/** Ảnh trong suốt 1px, thay cho ảnh đại diện không tải được */
const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
/** Phần tử không nên bị cắt ngang giữa hai trang */
const UNBREAKABLE =
  ".break-inside-avoid, .item, li, p, h1, h2, h3, h4, img, .avatar";

/**
 * Đẩy phần tử nằm vắt qua ranh giới trang (hoặc tiêu đề sát đáy trang) xuống đầu trang sau,
 * giống trình duyệt làm khi in. Duyệt theo thứ tự trong trang nên vị trí luôn được đo lại sau mỗi lần đẩy.
 */
function paginate(root: HTMLElement) {
  const origin = root.getBoundingClientRect().top;
  for (const el of root.querySelectorAll<HTMLElement>(UNBREAKABLE)) {
    if (el.parentElement?.closest("[data-cv-moved]")) continue; // cả khối cha đã được đẩy
    const rect = el.getBoundingClientRect();
    if (!rect.height) continue;
    const top = rect.top - origin;
    const page = Math.floor(top / A4_PX);
    const boundary = (page + 1) * A4_PX;
    const offset = top - page * A4_PX;
    let push = 0;
    if (top + rect.height > boundary + 0.5 && rect.height < A4_PX * 0.8) {
      push = boundary - top + PAGE_TOP_GAP;
    } else if (
      /^H[1-4]$/.test(el.tagName) &&
      top + rect.height > boundary - HEADING_KEEP
    ) {
      push = boundary - top + PAGE_TOP_GAP;
    } else if (page > 0 && offset < PAGE_TOP_GAP) {
      push = PAGE_TOP_GAP - offset; // nằm sát mép trên trang giấy
    }
    if (push > 0) {
      el.style.marginTop = `${
        parseFloat(getComputedStyle(el).marginTop) + push
      }px`;
      el.dataset.cvMoved = "";
    }
  }
}

const GSTATIC = /https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g;
const fontCss = new Map<string, Promise<string>>();

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * @font-face của một font CV (nhúng sẵn file font dạng data URL) để ảnh chụp đúng font.
 * Chỉ tải đúng họ font đang dùng; html-to-image tự quét thì sẽ tải hết mọi font trong CV_FONTS_URL.
 */
function embedFontCss(family: string): Promise<string> {
  let css = fontCss.get(family);
  if (!css) {
    css = (async () => {
      const spec = new URL(CV_FONTS_URL).searchParams
        .getAll("family")
        .find((f) => f.split(":")[0] === family);
      if (!spec) return "";
      const url = new URL("https://fonts.googleapis.com/css2");
      url.searchParams.set("family", spec);
      url.searchParams.set("display", "swap");
      const text = await (await fetch(url)).text();
      const files = [...new Set(text.match(GSTATIC) ?? [])];
      const data = new Map(
        await Promise.all(
          files.map(
            async (f) =>
              [f, await toDataUrl(await (await fetch(f)).blob())] as const
          )
        )
      );
      return text.replace(GSTATIC, (f) => data.get(f) ?? f);
    })().catch(() => {
      fontCss.delete(family); // lỗi mạng thì lần sau thử lại; lần này dùng font dự phòng
      return "";
    });
    fontCss.set(family, css);
  }
  return css;
}

/** Họ font chính của mọi phần tử trong CV */
function usedFamilies(root: HTMLElement): string[] {
  const names = new Set<string>();
  for (const el of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
    const first = getComputedStyle(el)
      .fontFamily.split(",")[0]
      ?.trim()
      .replace(/^["']|["']$/g, "");
    if (first) names.add(first);
  }
  return [...names];
}

/** Sau khi đẩy nội dung: kéo khung trang tới bội số A4 để màu nền cột phủ hết trang cuối */
function fitPages(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-cv-page]").forEach((page) => {
    page.style.minHeight = "";
    const n = Math.max(1, Math.ceil((page.offsetHeight - 0.5) / A4_PX));
    page.style.minHeight = `calc(${297 * n}mm - 0.5mm)`;
  });
  // mẫu có sẵn dạng cột (Modern): chiều cao theo biến --cv-pages
  const layout = root.firstElementChild as HTMLElement | null;
  const natural =
    layout?.dataset.cvLayout === "columns"
      ? Math.max(
          ...Array.from(layout.children, (c) => (c as HTMLElement).offsetHeight)
        )
      : root.scrollHeight;
  root.style.setProperty(
    "--cv-pages",
    String(Math.max(1, Math.ceil((natural - 2) / A4_PX)))
  );
}

/** Cắt ảnh CV thành từng trang A4 và ghép thành file PDF */
function savePdf(canvas: HTMLCanvasElement, fileName: string) {
  const pageH = A4_PX * SCALE;
  const pages = Math.max(1, Math.ceil((canvas.height - 2 * SCALE) / pageH));
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });
  const slice = document.createElement("canvas");
  slice.width = canvas.width;
  slice.height = Math.round(pageH);
  const ctx = slice.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");
  for (let i = 0; i < pages; i++) {
    const y = Math.round(i * pageH);
    const h = Math.min(slice.height, canvas.height - y);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    if (i > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );
  }
  pdf.setProperties({ title: fileName });
  pdf.save(`${fileName}.pdf`);
}

/**
 * Tải CV về máy dạng PDF khổ A4, không mở hộp thoại in. Chụp trang CV thành ảnh nét cao rồi chia trang;
 * làm trên bản sao ẩn để bản xem trước không bị xê dịch.
 */
export async function downloadCvPdf(
  source: HTMLElement,
  fileName: string
): Promise<void> {
  const host = document.createElement("div");
  host.className = "cv-export";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;top:0;left:-10000px;pointer-events:none;";
  const style = document.createElement("style");
  // không in chữ gợi ý của ô trống và viền ô sửa trực tiếp
  style.textContent =
    ".cv-export [data-placeholder]:empty::before{content:none!important}.cv-export [contenteditable]{outline:none!important}";
  const node = source.cloneNode(true) as HTMLElement;
  host.append(style, node);
  document.body.appendChild(host);
  try {
    await document.fonts?.ready;
    paginate(node);
    fitPages(node);
    const fonts = await Promise.all(usedFamilies(node).map(embedFontCss));
    const canvas = await toCanvas(node, {
      pixelRatio: SCALE,
      backgroundColor: "#ffffff",
      imagePlaceholder: BLANK_IMG,
      fontEmbedCSS: fonts.join("\n"),
    });
    savePdf(canvas, fileName);
  } finally {
    host.remove();
  }
}
