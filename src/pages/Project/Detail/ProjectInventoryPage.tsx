import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import ProjectSubHero from "../../../components/Project/Detail/ProjectSubHero";
import BookingLockModal from "../../../components/Project/Detail/BookingLockModal";
import UnitDetailModal from "../../../components/Project/Detail/inventory/UnitDetailModal";
import UnitCard from "../../../components/Project/Detail/inventory/UnitCard";
import InventoryStatusTabs from "../../../components/Project/Detail/inventory/InventoryStatusTabs";
import InventoryToolbar, {
  type InventoryView,
} from "../../../components/Project/Detail/inventory/InventoryToolbar";
import InventoryTable from "../../../components/Project/Detail/inventory/InventoryTable";
import InventoryPagination from "../../../components/Project/Detail/inventory/InventoryPagination";
import {
  canBook,
  toBookingUnit,
} from "../../../components/Project/Detail/inventory/toBookingUnit";
import {
  EMPTY_FILTER,
  filterUnits,
  type InventoryFilter,
} from "../../../components/Project/Detail/inventory/inventoryFilter";
import CompareTray from "../../../components/Project/Detail/inventory/compare/CompareTray";
import { useCompareSelection } from "../../../components/Project/Detail/inventory/compare/useCompareSelection";
import { useProjectUnits } from "../../../hooks/project/useProjectUnits";
import type { ProjectUnit } from "../../../types/project/projectUnits.types";
import { parseProjectId } from "../../../utils/slug";

const PER_PAGE = 12; // chia hết cho 2, 3, 4 cột của lưới thẻ

// So sánh để sắp xếp; căn chưa có giá / diện tích luôn nằm cuối
const SORTERS: Record<string, (a: ProjectUnit, b: ProjectUnit) => number> = {
  "price-asc": (a, b) =>
    (a.priceBillion ?? Infinity) - (b.priceBillion ?? Infinity),
  "price-desc": (a, b) =>
    (b.priceBillion ?? -Infinity) - (a.priceBillion ?? -Infinity),
  "area-desc": (a, b) => (b.area ?? -Infinity) - (a.area ?? -Infinity),
};

// Quỹ căn của dự án: thanh tình trạng, thanh lọc (áp dụng ngay), xem dạng thẻ hoặc bảng, chi tiết căn, giữ chỗ và chọn căn để so sánh
export default function ProjectInventoryPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0); // tải lại quỹ căn sau khi giữ chỗ / bị người khác giữ trước
  const state = useProjectUnits(projectId, reloadKey);

  const [filter, setFilter] = useState<InventoryFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState("default");
  const [view, setView] = useState<InventoryView>("grid");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ProjectUnit | null>(null); // căn đang xem chi tiết
  const [booking, setBooking] = useState<ProjectUnit | null>(null);
  const compare = useCompareSelection(projectId ?? null);

  const units = useMemo(
    () => (state.status === "ready" ? state.data.units : []),
    [state]
  );
  // Căn đã chọn theo thứ tự chọn; căn không còn trong quỹ căn thì bỏ qua
  const compareUnits = useMemo(
    () =>
      compare.ids
        .map((cid) => units.find((u) => u.id === cid))
        .filter((u): u is ProjectUnit => u !== undefined),
    [compare.ids, units]
  );
  const zones = useMemo(
    () => (state.status === "ready" ? state.data.zones : []),
    [state]
  );
  const types = useMemo(
    () =>
      Array.from(
        new Set(units.map((u) => u.type).filter((t) => t && t !== "—"))
      ).sort(),
    [units]
  );

  const rows = useMemo(() => {
    const r = filterUnits(units, filter);
    const sorter = SORTERS[sort];
    return sorter ? [...r].sort(sorter) : r;
  }, [units, filter, sort]);

  // Đổi bộ lọc / sắp xếp thì quay về trang 1
  const changeFilter = (next: InventoryFilter) => {
    setFilter(next);
    setPage(1);
  };
  const changeSort = (next: string) => {
    setSort(next);
    setPage(1);
  };

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div
          className="container mx-auto animate-pulse px-4 py-10 lg:px-8"
          aria-busy="true"
          aria-label="Đang tải quỹ căn"
        >
          <div className="h-40 rounded-[1.75rem] bg-white/70" />
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-24 rounded-[1.5rem] bg-white/70" />
            ))}
          </div>
          <div className="mt-6 h-32 rounded-[1.75rem] bg-white/70" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-[1.5rem] bg-white/70" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="heading-display text-2xl text-heading">
            {state.message}
          </p>
          <Link
            to="/projects"
            className="btn-gloss mt-6 inline-block rounded-full px-6 py-3 font-heading text-xs font-bold uppercase tracking-widest text-white"
          >
            Về danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  const { project } = state.data;
  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const book = (unit: ProjectUnit) => {
    if (!canBook(unit) || !project.bookingEnabled) return;
    setDetail(null);
    setBooking(unit);
  };
  const reload = () => setReloadKey((k) => k + 1);
  const compareProps = (u: ProjectUnit) => ({
    selected: compare.ids.includes(u.id),
    full: compare.full,
    onToggle: () => compare.toggle(u.id),
  });

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

      <ProjectSubHero
        base={base}
        projectName={project.name}
        title="Quỹ căn"
        desc={`Toàn bộ sản phẩm của ${project.name}: lọc theo tình trạng, phân khu, loại hình, giá và hướng; xem chi tiết, giữ chỗ hoặc chọn căn để so sánh.`}
        statLabel="Quỹ căn khả dụng"
        statValue={`${
          units.filter((u) => u.status === "available").length
        } căn`}
      />

      {/* Chừa chỗ cho thanh so sánh nổi ở đáy để không che phân trang */}
      <div
        className={`container mx-auto px-4 pt-10 lg:px-8 ${
          compareUnits.length > 0 ? "pb-36" : "pb-16"
        }`}
      >
        <InventoryStatusTabs
          units={units}
          value={filter.status}
          onChange={(status) => changeFilter({ ...filter, status })}
        />

        <div className="mt-5">
          <InventoryToolbar
            filter={filter}
            onChange={changeFilter}
            zones={zones}
            types={types}
            sort={sort}
            onSort={changeSort}
            view={view}
            onView={setView}
            total={rows.length}
          />
        </div>

        <div className="mt-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center">
              <SearchX size={28} className="text-primary-300" aria-hidden />
              <p className="mt-3 font-semibold text-heading">
                Không có căn nào phù hợp
              </p>
              <p className="mt-1 text-sm text-body">
                Thử đổi tình trạng hoặc bỏ bớt bộ lọc.
              </p>
            </div>
          ) : view === "grid" ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageRows.map((u) => (
                <li key={u.id}>
                  <UnitCard
                    unit={u}
                    bookingEnabled={project.bookingEnabled}
                    onOpen={() => setDetail(u)}
                    onBook={() => book(u)}
                    compare={compareProps(u)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <InventoryTable
              rows={pageRows}
              bookingEnabled={project.bookingEnabled}
              onOpen={setDetail}
              onBook={book}
              compareIds={compare.ids}
              compareFull={compare.full}
              onToggleCompare={(u) => compare.toggle(u.id)}
            />
          )}
        </div>

        <InventoryPagination
          total={rows.length}
          perPage={PER_PAGE}
          page={page}
          setPage={setPage}
        />
      </div>

      <CompareTray
        units={compareUnits}
        onRemove={compare.remove}
        onClear={compare.clear}
        onCompare={() => navigate(`${base}/compare`)}
      />
    </div>
  );
}
