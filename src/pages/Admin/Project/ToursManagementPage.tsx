import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown, ArrowRightLeft, ArrowUp, CheckCircle2, Compass, Crosshair, Eye, FolderPlus, Info, MapPin, Move, Pencil, Plus,
  Rocket, Save, ShieldCheck, Star, Trash2, Undo2, X,
} from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { HotspotFormModal, SceneFormModal, TourFormModal } from "../../../components/Admin/project/tours/TourModals";
import PanoramaViewer, { type PanoramaViewerHandle } from "../../../components/Project/Detail/tour/PanoramaViewer";
import TourPlayer from "../../../components/Project/Detail/tour/TourPlayer";
import TableSkeleton from "../../../components/common/TableSkeleton";
import useFocusTrap from "../../../components/common/useFocusTrap";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { adminTourService } from "../../../services/project/tourService";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { TourDto, TourHotspotDto, TourHotspotInput, TourSceneDto, TourSceneInput, TourValidation } from "../../../types/project/tour.types";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type Modal =
  | { kind: "tour"; edit: boolean }
  | { kind: "scene"; scene: TourSceneDto | null; parentId: number | null }
  | { kind: "hotspot"; hotspot: TourHotspotDto | null; coords: { yaw: number; pitch: number } }
  | { kind: "deleteTour" }
  | { kind: "deleteScene"; scene: TourSceneDto }
  | { kind: "deleteHotspot"; hotspot: TourHotspotDto }
  | null;

const btn = "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-50";
const iconBtn = "flex h-7 w-7 items-center justify-center rounded-md text-body transition hover:bg-primary-100 hover:text-primary-700 disabled:opacity-30";

// Sắp xếp cảnh theo cây: cha trước, các con (theo thứ tự) ngay sau, kèm độ sâu để thụt lề
function treeOrder(scenes: TourSceneDto[]): { scene: TourSceneDto; depth: number }[] {
  const ids = new Set(scenes.map((s) => s.id));
  const children = new Map<number | null, TourSceneDto[]>();
  scenes.forEach((s) => {
    const key = s.parentSceneId !== null && ids.has(s.parentSceneId) ? s.parentSceneId : null;
    children.set(key, [...(children.get(key) ?? []), s]);
  });
  children.forEach((list) => list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id));
  const out: { scene: TourSceneDto; depth: number }[] = [];
  const walk = (parent: number | null, depth: number) => {
    (children.get(parent) ?? []).forEach((s) => {
      out.push({ scene: s, depth });
      walk(s.id, depth + 1);
    });
  };
  walk(null, 0);
  return out;
}

function PreviewModal({ tour, onClose }: { tour: TourDto; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div ref={root} role="dialog" aria-modal="true" aria-label="Xem trước tour" tabIndex={-1} onClick={(e) => e.stopPropagation()} className="w-full max-w-6xl outline-none">
        <div className="mb-3 flex items-center justify-between text-white">
          <p className="font-semibold">Xem trước: {tour.title} {tour.status === "DRAFT" && <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">Bản nháp</span>}</p>
          <button type="button" onClick={onClose} aria-label="Đóng xem trước" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"><X size={18} /></button>
        </div>
        <TourPlayer tour={tour} className="h-[75vh]" />
      </div>
    </div>,
    document.body,
  );
}

// Quản lý tour 360°: tạo tour, thêm cảnh panorama phân cấp, đặt điểm chuyển cảnh / popup, kiểm tra và xuất bản
export default function ToursManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const { projectId } = useSelectedProject(boot.status === "ready" ? boot.projects : []);

  const [tours, setTours] = useState<TourDto[] | null>(null);
  const [tourId, setTourId] = useState<number | null>(null);
  const [tour, setTour] = useState<TourDto | null>(null);
  const [sceneId, setSceneId] = useState<number | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);
  const [moving, setMoving] = useState<TourHotspotDto | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [validation, setValidation] = useState<TourValidation | null>(null);
  const [preview, setPreview] = useState(false);
  const viewer = useRef<PanoramaViewerHandle>(null);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((projects) => !cancelled && setBoot({ status: "ready", projects }))
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  // Danh sách tour của dự án
  const loadTours = useCallback(
    async (selectId?: number) => {
      if (projectId === null) return;
      const list = await adminTourService.list(projectId);
      setTours(list);
      setTourId((cur) => selectId ?? (cur && list.some((t) => t.id === cur) ? cur : list[0]?.id ?? null));
    },
    [projectId],
  );

  useEffect(() => {
    setTours(null);
    setTour(null);
    setTourId(null);
    loadTours().catch((e) => {
      toast.show(getErrorMessage(e), "error");
      setTours([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Chi tiết tour đang chọn (cảnh + điểm)
  const reloadTour = useCallback(async () => {
    if (tourId === null) return;
    const t = await adminTourService.get(tourId);
    setTour(t);
    setSceneId((cur) => {
      const scenes = t.scenes ?? [];
      if (cur !== null && scenes.some((s) => s.id === cur)) return cur;
      return t.entrySceneId ?? scenes[0]?.id ?? null;
    });
  }, [tourId]);

  useEffect(() => {
    setTour(null);
    setValidation(null);
    setPlacing(false);
    setMoving(null);
    if (tourId !== null) reloadTour().catch((e) => toast.show(getErrorMessage(e), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const scenes = useMemo(() => tour?.scenes ?? [], [tour]);
  const tree = useMemo(() => treeOrder(scenes), [scenes]);
  const scene = scenes.find((s) => s.id === sceneId) ?? null;
  const sceneTitle = (id: number | null) => scenes.find((s) => s.id === id)?.title ?? "(cảnh đã xóa)";

  // Chạy thao tác: báo lỗi chung, tải lại tour sau khi xong
  const run = async (action: () => Promise<unknown>, success: string, after?: () => void) => {
    setBusy(true);
    try {
      await action();
      toast.show(success);
      after?.();
      await reloadTour();
      setValidation(null);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  // ----- Tour -----
  const saveTour = async (title: string, description: string) => {
    if (projectId === null) return;
    setBusy(true);
    try {
      if (modal?.kind === "tour" && modal.edit && tour) {
        await adminTourService.update(tour.id, { title, description, entrySceneId: tour.entrySceneId });
        toast.show("Đã lưu thông tin tour");
        await Promise.all([reloadTour(), loadTours(tour.id)]);
      } else {
        const created = await adminTourService.create(projectId, title, description);
        toast.show("Đã tạo tour, hãy thêm cảnh panorama đầu tiên");
        await loadTours(created.id);
      }
      setModal(null);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteTour = async () => {
    if (!tour) return;
    setBusy(true);
    try {
      await adminTourService.remove(tour.id);
      toast.show("Đã xóa tour");
      setModal(null);
      setTourId(null);
      await loadTours();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const checkTour = async () => {
    if (!tour) return;
    try {
      setValidation(await adminTourService.validate(tour.id));
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
  };

  const publish = async () => {
    if (!tour) return;
    const result = await adminTourService.validate(tour.id).catch(() => null);
    if (result && !result.valid) {
      setValidation(result);
      toast.show("Tour còn lỗi liên kết, xem chi tiết bên dưới", "error");
      return;
    }
    await run(() => adminTourService.publish(tour.id), "Đã xuất bản tour, khách có thể tham quan", () => void loadTours(tour.id));
  };

  // ----- Cảnh -----
  const saveScene = (input: TourSceneInput, image: File | null) => {
    if (!tour || modal?.kind !== "scene") return;
    const editing = modal.scene;
    void run(
      async () => {
        if (editing) await adminTourService.updateScene(editing.id, input, image);
        else {
          const created = await adminTourService.addScene(tour.id, input, image as File);
          setSceneId(created.id);
        }
      },
      editing ? "Đã lưu cảnh" : "Đã thêm cảnh",
      () => setModal(null),
    );
  };

  const moveScene = (s: TourSceneDto, dir: -1 | 1) => {
    if (!tour) return;
    const siblings = tree.map((t) => t.scene).filter((x) => x.parentSceneId === s.parentSceneId);
    const i = siblings.findIndex((x) => x.id === s.id);
    const j = i + dir;
    if (j < 0 || j >= siblings.length) return;
    const swapped = [...siblings];
    [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
    const rank = new Map(swapped.map((x, k) => [x.id, k]));
    // Thứ tự toàn tour: giữ nhóm khác, các cảnh cùng cha theo thứ tự mới
    const ordered = [...scenes].sort((a, b) => {
      const ra = rank.has(a.id) ? rank.get(a.id)! : a.sortOrder;
      const rb = rank.has(b.id) ? rank.get(b.id)! : b.sortOrder;
      return ra - rb || a.id - b.id;
    });
    void run(() => adminTourService.reorderScenes(tour.id, ordered.map((x) => x.id)), "Đã đổi thứ tự cảnh");
  };

  const setEntry = (s: TourSceneDto) => {
    if (!tour) return;
    void run(() => adminTourService.update(tour.id, { title: tour.title, description: tour.description, entrySceneId: s.id }), `Đã đặt "${s.title}" làm cảnh mở đầu`);
  };

  const saveInitialView = () => {
    if (!scene) return;
    const view = viewer.current?.getView();
    if (!view) return;
    void run(
      () => adminTourService.updateScene(scene.id, {
        title: scene.title,
        parentSceneId: scene.parentSceneId,
        initialYaw: Math.round(view.yaw * 100) / 100,
        initialPitch: Math.round(view.pitch * 100) / 100,
        initialHfov: Math.min(120, Math.max(30, Math.round(view.hfov))),
      }),
      "Đã lưu góc nhìn hiện tại làm góc nhìn ban đầu của cảnh",
    );
  };

  // ----- Điểm nóng -----
  const onPanoramaClick = (coords: { yaw: number; pitch: number }) => {
    if (moving && scene) {
      const h = moving;
      setMoving(null);
      void run(
        () => adminTourService.updateHotspot(h.id, { type: h.type, title: h.title, yaw: coords.yaw, pitch: coords.pitch, targetSceneId: h.targetSceneId, description: h.description ?? "" }),
        `Đã dời điểm "${h.title}"`,
      );
      return;
    }
    if (placing) {
      setPlacing(false);
      setModal({ kind: "hotspot", hotspot: null, coords });
    }
  };

  const saveHotspot = (input: TourHotspotInput, image: File | null) => {
    if (!scene || modal?.kind !== "hotspot") return;
    const editing = modal.hotspot;
    void run(
      () => (editing ? adminTourService.updateHotspot(editing.id, input, image) : adminTourService.addHotspot(scene.id, input, image)),
      editing ? "Đã lưu điểm" : "Đã thêm điểm",
      () => setModal(null),
    );
  };

  const header = (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Tour 360°" }]}
      title="Tour tham quan 360°"
      desc="Tải ảnh panorama, sắp xếp cảnh theo cấp (toàn dự án → phân khu → tòa → căn mẫu), đặt điểm chuyển cảnh hoặc popup thông tin rồi xuất bản cho khách."
    />
  );

  if (boot.status === "loading") {
    return <div className="animate-page-in">{header}<div className="px-4 md:px-8"><TableSkeleton rows={4} label="Đang tải" /></div></div>;
  }
  if (boot.status === "error" || projectId === null) {
    return (
      <div className="animate-page-in">
        {header}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
        </div>
      </div>
    );
  }

  const hotspots = scene?.hotspots ?? [];
  const viewerMode = moving ? `Bấm lên ảnh để đặt lại vị trí điểm "${moving.title}"` : placing ? "Bấm vào vị trí muốn đặt điểm trên ảnh" : null;

  return (
    <div className="animate-page-in">
      {header}
      <ProjectManageBar projectId={projectId} />

      <div className="space-y-4 px-4 pb-12 md:px-8">
        {/* Thanh tour */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
          {tours === null ? (
            <span className="text-sm text-body">Đang tải tour...</span>
          ) : tours.length === 0 ? (
            <span className="text-sm text-body">Dự án chưa có tour 360° nào.</span>
          ) : (
            <select
              value={tourId ?? ""}
              onChange={(e) => setTourId(Number(e.target.value))}
              aria-label="Chọn tour"
              className="h-10 min-w-56 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-footer outline-none focus:border-primary-300"
            >
              {tours.map((t) => <option key={t.id} value={t.id}>{t.title}{t.status === "PUBLISHED" ? " · Đã xuất bản" : " · Bản nháp"}</option>)}
            </select>
          )}
          {tour && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tour.status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {tour.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
            </span>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => setModal({ kind: "tour", edit: false })}><Plus size={14} /> Tạo tour</button>
            {tour && (
              <>
                <button type="button" className={btn} onClick={() => setModal({ kind: "tour", edit: true })}><Pencil size={14} /> Sửa thông tin</button>
                <button type="button" className={btn} onClick={() => void checkTour()}><ShieldCheck size={14} /> Kiểm tra</button>
                <button type="button" className={btn} disabled={scenes.length === 0} onClick={() => setPreview(true)}><Eye size={14} /> Xem trước</button>
                {tour.status === "PUBLISHED" ? (
                  <button type="button" className={btn} disabled={busy} onClick={() => void run(() => adminTourService.unpublish(tour.id), "Đã chuyển tour về bản nháp", () => void loadTours(tour.id))}>
                    <Undo2 size={14} /> Về bản nháp
                  </button>
                ) : (
                  <button type="button" disabled={busy || scenes.length === 0} onClick={() => void publish()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">
                    <Rocket size={14} /> Xuất bản
                  </button>
                )}
                <button type="button" className={`${btn} text-danger`} onClick={() => setModal({ kind: "deleteTour" })}><Trash2 size={14} /> Xóa tour</button>
              </>
            )}
          </div>
        </div>

        {/* Kết quả kiểm tra */}
        {validation && (
          <div className={`rounded-2xl border p-4 text-sm ${validation.valid ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`} role="status">
            <div className="flex items-start justify-between gap-3">
              <p className={`flex items-center gap-2 font-semibold ${validation.valid ? "text-success" : "text-danger"}`}>
                {validation.valid ? <CheckCircle2 size={16} /> : <X size={16} />}
                {validation.valid ? "Tour hợp lệ, có thể xuất bản" : `Còn ${validation.errors.length} lỗi cần sửa trước khi xuất bản`}
              </p>
              <button type="button" onClick={() => setValidation(null)} aria-label="Ẩn kết quả kiểm tra" className={iconBtn}><X size={14} /></button>
            </div>
            {validation.errors.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-danger">{validation.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
            {validation.warnings.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-warning">{validation.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
          </div>
        )}

        {tours !== null && tours.length === 0 && (
          <button
            type="button"
            onClick={() => setModal({ kind: "tour", edit: false })}
            className="flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-primary-200 bg-white px-6 py-16 text-center transition hover:border-primary-400 hover:bg-primary-50/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600"><Compass size={26} /></span>
            <span className="text-lg font-semibold text-footer">Tạo tour 360° đầu tiên cho dự án</span>
            <span className="text-sm text-body">Bắt đầu bằng ảnh toàn cảnh dự án, sau đó thêm các cảnh con và nối chúng bằng điểm chuyển cảnh.</span>
          </button>
        )}

        {tour && (
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
            {/* Cây cảnh */}
            <aside className="flex max-h-[680px] flex-col rounded-2xl border border-line bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-line p-4">
                <h2 className="font-semibold text-footer">Cảnh <span className="text-xs font-normal text-muted">({scenes.length})</span></h2>
                <button type="button" className={btn} onClick={() => setModal({ kind: "scene", scene: null, parentId: null })}><Plus size={13} /> Cảnh gốc</button>
              </div>
              <ul className="flex-1 overflow-y-auto p-2">
                {tree.length === 0 && <li className="px-3 py-8 text-center text-sm text-body">Chưa có cảnh. Thêm ảnh toàn cảnh dự án làm cảnh gốc.</li>}
                {tree.map(({ scene: s, depth }) => {
                  const active = s.id === sceneId;
                  const siblings = tree.filter((t) => t.scene.parentSceneId === s.parentSceneId);
                  const idx = siblings.findIndex((t) => t.scene.id === s.id);
                  return (
                    <li key={s.id}>
                      <div className={`group rounded-lg ${active ? "bg-primary-50 ring-1 ring-primary-200" : "hover:bg-primary-50/50"}`} style={{ marginLeft: depth * 14 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSceneId(s.id);
                            setSelectedHotspot(null);
                            setPlacing(false);
                            setMoving(null);
                          }}
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                        >
                          {tour.entrySceneId === s.id && <Star size={13} className="shrink-0 fill-gold-400 text-gold-500" aria-label="Cảnh mở đầu" />}
                          <span className={`min-w-0 flex-1 truncate text-sm ${active ? "font-semibold text-primary-700" : "text-footer"}`}>{s.title}</span>
                          <span className="shrink-0 text-[10px] text-muted">{(s.hotspots ?? []).length} điểm</span>
                        </button>
                        {active && (
                          <div className="flex flex-wrap gap-0.5 px-2 pb-2">
                            <button type="button" className={iconBtn} title="Thêm cảnh con" aria-label="Thêm cảnh con" onClick={() => setModal({ kind: "scene", scene: null, parentId: s.id })}><FolderPlus size={14} /></button>
                            <button type="button" className={iconBtn} title="Sửa cảnh" aria-label="Sửa cảnh" onClick={() => setModal({ kind: "scene", scene: s, parentId: s.parentSceneId })}><Pencil size={14} /></button>
                            <button type="button" className={iconBtn} title="Lên" aria-label="Chuyển lên" disabled={idx <= 0 || busy} onClick={() => moveScene(s, -1)}><ArrowUp size={14} /></button>
                            <button type="button" className={iconBtn} title="Xuống" aria-label="Chuyển xuống" disabled={idx >= siblings.length - 1 || busy} onClick={() => moveScene(s, 1)}><ArrowDown size={14} /></button>
                            {tour.entrySceneId !== s.id && (
                              <button type="button" className={iconBtn} title="Đặt làm cảnh mở đầu" aria-label="Đặt làm cảnh mở đầu" disabled={busy} onClick={() => setEntry(s)}><Star size={14} /></button>
                            )}
                            <button type="button" className={`${iconBtn} hover:text-danger`} title="Xóa cảnh" aria-label="Xóa cảnh" onClick={() => setModal({ kind: "deleteScene", scene: s })}><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Trình xem: đặt điểm */}
            <section className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!scene}
                  aria-pressed={placing}
                  onClick={() => {
                    setPlacing((p) => !p);
                    setMoving(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${placing ? "bg-primary-600 text-white" : "border border-line bg-white text-footer hover:bg-primary-50"}`}
                >
                  <Crosshair size={14} /> {placing ? "Đang đặt điểm..." : "Đặt điểm mới"}
                </button>
                <button type="button" className={btn} disabled={!scene || busy} onClick={saveInitialView} title="Xoay và zoom tới góc muốn khách thấy đầu tiên rồi bấm">
                  <Save size={14} /> Lưu góc nhìn ban đầu
                </button>
                {viewerMode && (
                  <span className="flex items-center gap-2 rounded-lg bg-gold-200/40 px-3 py-2 text-xs font-medium text-gold-950">
                    {viewerMode}
                    <button type="button" onClick={() => { setPlacing(false); setMoving(null); }} className="font-semibold underline">Hủy</button>
                  </span>
                )}
              </div>
              {scene ? (
                <PanoramaViewer
                  ref={viewer}
                  scenes={scenes}
                  sceneId={scene.id}
                  version={tour.updatedAt}
                  selectedHotspotId={selectedHotspot}
                  onHotspotClick={(h) => {
                    if (placing || moving) return;
                    setSelectedHotspot(h.id);
                  }}
                  onPanoramaClick={onPanoramaClick}
                  className={`h-[560px] rounded-2xl ${placing || moving ? "cursor-crosshair ring-2 ring-primary-400" : ""}`}
                />
              ) : (
                <div className="flex h-[560px] items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-white text-sm text-body">
                  Chọn hoặc thêm một cảnh để bắt đầu đặt điểm.
                </div>
              )}
              {scene && (
                <p className="mt-2 text-xs text-body">
                  Cảnh: <b>{scene.title}</b>
                  {scene.parentSceneId !== null ? ` · thuộc "${sceneTitle(scene.parentSceneId)}"` : " · cảnh gốc"}
                </p>
              )}
            </section>

            {/* Danh sách điểm của cảnh */}
            <aside className="flex max-h-[680px] flex-col rounded-2xl border border-line bg-white shadow-sm">
              <div className="border-b border-line p-4">
                <h2 className="font-semibold text-footer">Điểm trên cảnh <span className="text-xs font-normal text-muted">({hotspots.length})</span></h2>
                <p className="mt-1 text-xs text-body">Bấm "Đặt điểm mới" rồi bấm lên ảnh để thêm.</p>
              </div>
              <ul className="flex-1 divide-y divide-line overflow-y-auto">
                {hotspots.length === 0 && <li className="px-4 py-8 text-center text-sm text-body">{scene ? "Cảnh chưa có điểm nào." : "—"}</li>}
                {hotspots.map((h) => {
                  const active = selectedHotspot === h.id;
                  return (
                    <li key={h.id} className={active ? "bg-primary-50" : ""}>
                      <button type="button" onClick={() => setSelectedHotspot(active ? null : h.id)} className="flex w-full items-start gap-2.5 px-4 py-3 text-left">
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${h.type === "SCENE" ? "bg-gold-500" : "bg-navy"}`}>
                          {h.type === "SCENE" ? <ArrowRightLeft size={13} /> : <Info size={13} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-footer">{h.title}</span>
                          <span className="block truncate text-xs text-body">
                            {h.type === "SCENE" ? `→ ${h.targetSceneId !== null ? sceneTitle(h.targetSceneId) : "chưa chọn cảnh đích"}` : "Popup thông tin"}
                          </span>
                        </span>
                      </button>
                      {active && scene && (
                        <div className="flex gap-1 px-4 pb-3">
                          <button type="button" className={btn} onClick={() => setModal({ kind: "hotspot", hotspot: h, coords: { yaw: h.yaw, pitch: h.pitch } })}><Pencil size={13} /> Sửa</button>
                          <button type="button" className={btn} onClick={() => { setMoving(h); setPlacing(false); }}><Move size={13} /> Dời</button>
                          {h.type === "SCENE" && h.targetSceneId !== null && (
                            <button type="button" className={btn} onClick={() => setSceneId(h.targetSceneId)}><MapPin size={13} /> Mở cảnh</button>
                          )}
                          <button type="button" className={`${btn} text-danger`} onClick={() => setModal({ kind: "deleteHotspot", hotspot: h })}><Trash2 size={13} /></button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        )}
      </div>

      {modal?.kind === "tour" && (
        <TourFormModal initial={modal.edit && tour ? { title: tour.title, description: tour.description } : null} busy={busy} onSubmit={(t, d) => void saveTour(t, d)} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "scene" && (
        <SceneFormModal scene={modal.scene} scenes={scenes} defaultParentId={modal.parentId} busy={busy} onSubmit={saveScene} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "hotspot" && scene && (
        <HotspotFormModal hotspot={modal.hotspot} coords={modal.coords} scenes={scenes} currentSceneId={scene.id} busy={busy} onSubmit={saveHotspot} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "deleteTour" && tour && (
        <ConfirmDialog
          title={`Xóa tour "${tour.title}"?`}
          message="Toàn bộ cảnh, điểm và ảnh panorama của tour sẽ bị xóa vĩnh viễn."
          onConfirm={() => void deleteTour()}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "deleteScene" && (
        <ConfirmDialog
          title={`Xóa cảnh "${modal.scene.title}"?`}
          message="Các điểm trên cảnh này bị xóa; điểm ở cảnh khác đang dẫn tới cảnh này sẽ mất cảnh đích (cần chọn lại trước khi xuất bản)."
          onConfirm={() => {
            const s = modal.scene;
            void run(() => adminTourService.removeScene(s.id), "Đã xóa cảnh", () => {
              setModal(null);
              if (sceneId === s.id) setSceneId(null);
            });
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "deleteHotspot" && (
        <ConfirmDialog
          title={`Xóa điểm "${modal.hotspot.title}"?`}
          message="Điểm sẽ bị gỡ khỏi cảnh."
          onConfirm={() => {
            const h = modal.hotspot;
            void run(() => adminTourService.removeHotspot(h.id), "Đã xóa điểm", () => {
              setModal(null);
              setSelectedHotspot(null);
            });
          }}
          onClose={() => setModal(null)}
        />
      )}
      {preview && tour && <PreviewModal tour={tour} onClose={() => setPreview(false)} />}
    </div>
  );
}
