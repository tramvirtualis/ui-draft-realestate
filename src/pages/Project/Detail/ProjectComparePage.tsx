import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftRight, ChevronRight, Download, Plus, Trash2, Trophy } from "lucide-react";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import BookingLockModal from "../../../components/Project/Detail/BookingLockModal";
import UnitDetailModal from "../../../components/Project/Detail/inventory/UnitDetailModal";
import Lightbox from "../../../components/common/Lightbox";
import { useToast } from "../../../components/common/toastContext";
import CompareTable from "../../../components/Project/Detail/inventory/compare/CompareTable";
import { highlights, photosOf } from "../../../components/Project/Detail/inventory/compare/compareRows";
import { exportCompareImage } from "../../../components/Project/Detail/inventory/compare/exportCompareImage";
import { MAX_COMPARE, useCompareSelection } from "../../../components/Project/Detail/inventory/compare/useCompareSelection";
import { canBook, toBookingUnit } from "../../../components/Project/Detail/inventory/toBookingUnit";
import { useProjectUnits } from "../../../hooks/project/useProjectUnits";
import type { ProjectUnit } from "../../../types/project/projectUnits.types";
import type { ViewImage } from "../../../types/project/progress.types";
import { parseProjectId, slugify } from "../../../utils/slug";

type Viewer = { images: ViewImage[]; index: number } | null;

// So sánh căn: các căn đã chọn ở trang Quỹ căn (nhớ trong phiên), bảng tiêu chí chi tiết, điểm nổi bật, tải ảnh bảng so sánh
export default function ProjectComparePage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const toast = useToast();
  const [reloadKey, setReloadKey] = useState(0); // tải lại sau khi giữ chỗ để cập nhật tình trạng căn
  const state = useProjectUnits(projectId, reloadKey);
  const compare = useCompareSelection(projectId ?? null);
  const tableRef = useRef<HTMLTableElement>(null);

  const [diffOnly, setDiffOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [detail, setDetail] = useState<ProjectUnit | null>(null);
  const [booking, setBooking] = useState<ProjectUnit | null>(null);

  const units = useMemo(() => {
    if (state.status !== "ready") return [];
    const all = state.data.units;
    return compare.ids.map((cid) => all.find((u) => u.id === cid)).filter((u): u is ProjectUnit => u !== undefined);
  }, [state, compare.ids]);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="container mx-auto animate-pulse px-4 py-10 lg:px-8" aria-busy="true" aria-label="Đang tải bảng so sánh">
          <div className="h-8 w-64 rounded bg-white" />
          <div className="mt-8 h-[480px] rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">{state.message}</p>
          <Link to="/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
        </div>
      </div>
    );
  }

  const { project } = state.data;
  const wins = highlights(units);
  const book = (unit: ProjectUnit) => {
    if (!canBook(unit) || !project.bookingEnabled) return;
    setDetail(null);
    setBooking(unit);
  };
  const reload = () => setReloadKey((k) => k + 1);

  const download = async () => {
    if (!tableRef.current) return;
    setExporting(true);
    try {
      await exportCompareImage(tableRef.current, `so-sanh-can-${slugify(project.name)}.png`);
    } catch {
      toast.show("Không tạo được ảnh so sánh, vui lòng thử lại", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />
      {detail && (
        <UnitDetailModal
          key={detail.id}
          projectId={projectId ?? null}
          unit={detail}
          bookingEnabled={project.bookingEnabled}
          onClose={() => setDetail(null)}
          onBook={() => book(detail)}
        />
      )}
      {booking && (
        <BookingLockModal
          key={booking.id}
          projectId={projectId ?? null}
          propertyId={booking.id}
          unit={toBookingUnit(booking)}
          onClose={() => setBooking(null)}
          onBooked={reload}
          onConflict={reload}
        />
      )}
      {viewer && (
        <Lightbox
          images={viewer.images}
          index={viewer.index}
          onIndexChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
          onClose={() => setViewer(null)}
        />
      )}

      <div className="container mx-auto px-4 pb-16 pt-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-body">
          <Link to={base} className="transition hover:text-primary-700">{project.name}</Link>
          <ChevronRight size={12} aria-hidden />
          <Link to={`${base}/inventory`} className="transition hover:text-primary-700">Quỹ căn</Link>
          <ChevronRight size={12} aria-hidden />
          <span className="font-semibold text-heading" aria-current="page">So sánh căn</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="heading-display text-3xl text-heading md:text-5xl">So sánh căn</h1>
            <p className="mt-1 text-sm text-body">
              <span className="font-semibold tabular-nums text-heading">{units.length}/{MAX_COMPARE}</span> căn đang được so sánh
            </p>
          </div>
          {units.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="mr-2 flex cursor-pointer items-center gap-2 text-sm font-medium text-heading">
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="h-4 w-4 accent-navy" />
                Chỉ hiện điểm khác nhau
              </label>
              {!compare.full && (
                <Link to={`${base}/inventory`} className="flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-navy">
                  <Plus size={15} aria-hidden /> Thêm căn
                </Link>
              )}
              <button
                type="button"
                onClick={download}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                <Download size={15} aria-hidden /> {exporting ? "Đang tạo ảnh..." : "Tải ảnh so sánh"}
              </button>
              <button
                type="button"
                onClick={compare.clear}
                className="flex items-center gap-1.5 rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/15"
              >
                <Trash2 size={15} aria-hidden /> Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {units.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-white px-6 py-16 text-center">
            <ArrowLeftRight size={28} className="text-primary-300" aria-hidden />
            <p className="mt-3 font-semibold text-heading">Chưa có căn nào để so sánh</p>
            <p className="mt-1 text-sm text-body">Bấm "So sánh" trên các căn ở trang Quỹ căn để thêm tối đa {MAX_COMPARE} căn.</p>
            <Link to={`${base}/inventory`} className="mt-5 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
              Chọn căn
            </Link>
          </div>
        ) : (
          <>
            {units.length === 1 && (
              <p className="mt-6 rounded-xl border border-gold-300/60 bg-gold-300/15 px-4 py-3 text-sm text-heading">
                Chọn thêm ít nhất 1 căn ở{" "}
                <Link to={`${base}/inventory`} className="font-semibold text-primary-600 hover:underline">Quỹ căn</Link> để bắt đầu so sánh.
              </p>
            )}

            {wins.length > 0 && (
              <section aria-label="Điểm nổi bật" className="mt-6 rounded-2xl bg-primary-600 px-5 py-4 text-white md:px-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                  <Trophy size={14} aria-hidden /> Điểm nổi bật
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {wins.map((w) => (
                    <li key={w.label} className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm">
                      <span className="text-white/70">{w.label}: </span>
                      <span className="font-semibold text-gold-200">{w.winners.map((u) => u.code).join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <CompareTable
                ref={tableRef}
                units={units}
                bookingEnabled={project.bookingEnabled}
                diffOnly={diffOnly}
                onRemove={compare.remove}
                onOpenPhotos={(u, index) => {
                  const photos = photosOf(u);
                  if (photos.length > 0) setViewer({ images: photos.map((src) => ({ src, title: `Căn ${u.code}`, date: null })), index });
                }}
                onOpen={setDetail}
                onBook={book}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
