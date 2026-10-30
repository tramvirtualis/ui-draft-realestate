// Kiểu tối thiểu cho Pannellum 2.5 (thư viện gán window.pannellum khi được import, không có type sẵn)

export type PnlmHotSpot = {
  pitch: number;
  yaw: number;
  cssClass?: string;
  createTooltipFunc?: (div: HTMLDivElement, args: unknown) => void;
  createTooltipArgs?: unknown;
  clickHandlerFunc?: (event: MouseEvent, args: unknown) => void;
  clickHandlerArgs?: unknown;
};

export type PnlmScene = {
  type: "equirectangular";
  panorama: string;
  yaw?: number;
  pitch?: number;
  hfov?: number;
  hotSpots?: PnlmHotSpot[];
};

export interface PnlmViewer {
  loadScene(sceneId: string, pitch?: number | "same", yaw?: number | "same", hfov?: number | "same"): void;
  getScene(): string;
  getYaw(): number;
  getPitch(): number;
  getHfov(): number;
  mouseEventToCoords(event: MouseEvent): [number, number];
  toggleFullscreen(): void;
  isLoaded(): boolean;
  on(event: "load" | "scenechange" | "error" | "fullscreenchange", listener: (arg: unknown) => void): void;
  destroy(): void;
}

type PnlmGlobal = { viewer(container: HTMLElement, config: Record<string, unknown>): PnlmViewer };

let loading: Promise<PnlmGlobal> | null = null;

// Tải thư viện khi cần (chỉ lúc khách bấm tham quan / admin mở trình sửa), không làm nặng trang
export function loadPannellum(): Promise<PnlmGlobal> {
  if (!loading) {
    loading = Promise.all([import("pannellum/build/pannellum.js"), import("pannellum/build/pannellum.css")]).then(() => {
      const g = (window as unknown as { pannellum?: PnlmGlobal }).pannellum;
      if (!g) throw new Error("Không tải được trình xem 360°");
      return g;
    });
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

// Ảnh panorama trên Cloudinary: giới hạn bề rộng theo thiết bị (mobile 4096px, desktop 7000px) để tải nhanh và vừa bộ nhớ GPU.
// Gói Cloudinary chỉ cho ảnh đã biến đổi tối đa 25 megapixel: 8192×4096 (33,5MP) bị trả lỗi 400, 7000×3500 (24,5MP) thì được.
export function panoramaUrl(url: string): string {
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  const width = window.innerWidth < 768 ? 4096 : 7000;
  return url.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto:good/`);
}

// Ảnh bìa nhẹ cho danh sách / màn hình chờ
export function coverUrl(url: string, width = 1600): string {
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  return url.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto,f_auto/`);
}
