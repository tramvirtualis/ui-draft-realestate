import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, ArrowRight, MapPin, Building2 } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { FALLBACK_IMAGE } from "../../components/Project/List/projectCardData";
import { BUILDING_TYPE_LABEL } from "../../services/project/projectService";
import { favoriteService } from "../../services/project/favoriteService";
import type { PageResponse } from "../../types/common.types";
import type { FavoriteDto } from "../../types/project/project.types";

const PAGE_SIZE = 9;

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: PageResponse<FavoriteDto> };

export default function FavoritesPage() {
  const toast = useToast();
  const [state, setState] = useState<State>({ status: "loading" });
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    favoriteService
      .getMine(page, PAGE_SIZE)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((e) => !cancelled && setState({ status: "error", message: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  const remove = useCallback(
    async (projectId: number) => {
      try {
        await favoriteService.toggle(projectId);
        toast.show("Đã bỏ lưu dự án");
        setReload((n) => n + 1);
      } catch (e) {
        toast.show(getErrorMessage(e), "error");
      }
    },
    [toast],
  );

  const items = state.status === "ready" ? state.data.content : [];

  return (
    <div>
      <nav className="flex items-center gap-3 text-xs text-muted">
        <span>Tài khoản</span> <ChevronRight size={12} />
        <span className="font-semibold text-primary-600">Dự án đã lưu</span>
      </nav>
      <h1 className="mt-4 text-4xl font-bold text-heading">Dự án đã lưu</h1>
      <p className="mt-2 text-sm text-body">Những dự án bạn đã lưu để xem lại và theo dõi thông tin mới nhất.</p>

      <div className="mt-6">
        {state.status === "loading" ? (
          <div className="grid animate-pulse gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((n) => <div key={n} className="h-72 rounded-3xl bg-primary-50" />)}
          </div>
        ) : state.status === "error" ? (
          <p role="alert" className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">{state.message}</p>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line bg-white py-16 text-center shadow-sm">
            <Heart size={36} className="mx-auto text-primary-300" />
            <p className="mt-4 font-semibold text-heading">Bạn chưa lưu dự án nào</p>
            <Link to="/projects" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-medium text-white">
              Khám phá dự án <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((f) => (
                <article key={f.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
                  <div className="relative">
                    <img src={f.project.overviewImage ?? FALLBACK_IMAGE} alt={f.project.name} className="w-full object-cover" style={{ height: 180 }} />
                    <button
                      onClick={() => void remove(f.projectId)}
                      aria-label="Bỏ lưu dự án"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary-600 shadow"
                    >
                      <Heart size={16} className="fill-primary-600" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-heading">{f.project.name}</h2>
                    {f.project.location && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-body"><MapPin size={14} className="text-primary-500" /> {f.project.location}</p>
                    )}
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-body">
                      <Building2 size={14} className="text-primary-500" />
                      {f.project.buildingType ? BUILDING_TYPE_LABEL[f.project.buildingType] : "Đang cập nhật"}
                      {f.project.investor ? ` · ${f.project.investor}` : ""}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Link to={`/projects/${f.projectId}`} className="flex items-center gap-1 text-xs font-semibold text-heading">
                        Xem dự án <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {state.status === "ready" && state.data.totalPages > 1 && (
              <div className="mt-8">
                <Pagination page={page} totalPages={state.data.totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
