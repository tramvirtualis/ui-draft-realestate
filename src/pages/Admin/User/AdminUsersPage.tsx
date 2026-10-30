import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RotateCcw, Search, Shield, ShieldCheck, UserPlus, UserRound, Users } from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import FilterSelect from "../../../components/Admin/FilterSelect";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import AdminUsersTable from "../../../components/Admin/users/AdminUsersTable";
import CreateUserModal from "../../../components/Admin/users/CreateUserModal";
import UserDetailModal from "../../../components/Admin/users/UserDetailModal";
import UserStatusTabs, { type UserStatusFilter } from "../../../components/Admin/users/UserStatusTabs";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { useToast } from "../../../components/common/toastContext";
import useDelayedLoad from "../../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../../api";
import { adminUserService, type AdminUserCreateInput } from "../../../services/user/adminUserService";
import { selectCurrentUser, useAppSelector } from "../../../store";
import { roleLabel, type AdminUser, type AdminUserStats, type RoleOption } from "../../../types/admin/adminUser.types";

const PAGE_SIZE = 10;
const EMPTY_STATS: AdminUserStats = { all: 0, active: 0, inactive: 0, locked: 0 };

const field =
  "h-11 rounded-xl border border-line bg-white text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Icon theo vai trò cho dropdown lọc
const roleIcon = (name?: string | null) =>
  name?.endsWith("SUPER_ADMIN") ? ShieldCheck : name?.endsWith("ADMIN") ? Shield : UserRound;

// Quản lý người dùng: tìm kiếm, lọc trạng thái / vai trò / ngày tạo, khóa / mở khóa, đổi vai trò — lọc và phân trang ở server
export default function AdminUsersPage() {
  const toast = useToast();
  const me = useAppSelector(selectCurrentUser);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<UserStatusFilter>("all");
  const [roleId, setRoleId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [locking, setLocking] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  // Tìm khi bấm nút "Tìm kiếm" hoặc Enter; xóa hết chữ thì hiện lại toàn bộ danh sách ngay
  const search = (e: FormEvent) => {
    e.preventDefault();
    // Bấm lại với cùng từ khóa thì tải lại kết quả
    if (input.trim() === keyword) return list.reload();
    setKeyword(input.trim());
    setPage(0);
  };
  const changeInput = (value: string) => {
    setInput(value);
    if (!value.trim() && keyword) {
      setKeyword("");
      setPage(0);
    }
  };

  useEffect(() => {
    adminUserService.roles().then(setRoles).catch(() => undefined);
  }, []);

  const loadStats = useCallback(() => adminUserService.stats().then(setStats).catch(() => undefined), []);
  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang / bộ lọc; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(JSON.stringify([keyword, status, roleId, from, to, page]), () =>
    adminUserService.search({
      keyword,
      status: status === "all" ? null : status,
      roleId: roleId ? Number(roleId) : null,
      from,
      to,
      page,
      size: PAGE_SIZE,
    }),
  );

  const refresh = () => {
    list.reload();
    void loadStats();
  };

  const items = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const pages = list.data?.totalPages ?? 1;
  const rangeFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeTo = Math.min(total, (page + 1) * PAGE_SIZE);
  const badRange = from !== "" && to !== "" && from > to;
  const hasFilter = input.trim() !== "" || status !== "all" || roleId !== "" || from !== "" || to !== "";

  const changeFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const resetFilters = () => {
    setInput("");
    setKeyword("");
    setStatus("all");
    setRoleId("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const setLocked = async (u: AdminUser, locked: boolean) => {
    setBusyId(u.id);
    try {
      await adminUserService.setLocked(u.id, locked);
      toast.show(locked ? `Đã khóa tài khoản ${u.fullName ?? u.email}` : `Đã mở khóa tài khoản ${u.fullName ?? u.email}`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmLock = async () => {
    if (!locking) return;
    await setLocked(locking, true);
    setLocking(null);
  };

  // Tạo xong: đóng form, mở chi tiết tài khoản vừa tạo và tải lại danh sách + thẻ đếm
  const createUser = async (input: AdminUserCreateInput) => {
    setCreateBusy(true);
    try {
      const created = await adminUserService.createUser(input);
      toast.show(`Đã tạo tài khoản ${created.fullName ?? created.email}`);
      setCreating(false);
      setViewing(created);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setCreateBusy(false);
    }
  };

  const changeRole = async (u: AdminUser, nextRoleId: number) => {
    try {
      const saved = await adminUserService.changeRole(u.id, nextRoleId);
      toast.show(`Đã đổi vai trò của ${u.fullName ?? u.email} thành ${roleLabel(saved.role?.name)}`);
      setViewing(saved);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Hệ thống" }, { label: "Quản lý người dùng" }]}
        title="Quản lý người dùng"
        desc="Tạo, tìm kiếm, lọc, khóa / mở khóa tài khoản và phân quyền cho người dùng trong hệ thống."
        action={
          <button
            onClick={() => setCreating(true)}
            disabled={roles.length === 0}
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <UserPlus size={18} /> Thêm người dùng
          </button>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <UserStatusTabs value={status} stats={stats} onChange={changeFilter(setStatus)} />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <form onSubmit={search} role="search" className="flex min-w-60 flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={input}
                  onChange={(e) => changeInput(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  aria-label="Tìm người dùng"
                  className={`${field} w-full pl-11 pr-4`}
                />
              </div>
              <button
                type="submit"
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
              >
                <Search size={15} /> Tìm kiếm
              </button>
            </form>
            <FilterSelect
              label="Vai trò"
              value={roleId}
              onChange={changeFilter(setRoleId)}
              options={[
                { value: "", label: "Tất cả", desc: "Mọi vai trò", icon: Users },
                ...roles.map((r) => ({ value: String(r.id), label: roleLabel(r.name), icon: roleIcon(r.name) })),
              ]}
            />
            <div className="flex items-center gap-2">
              <input type="date" value={from} max={to || undefined} onChange={(e) => changeFilter(setFrom)(e.target.value)} aria-label="Tạo từ ngày" className={`${field} px-3`} />
              <span className="text-sm text-body">→</span>
              <input type="date" value={to} min={from || undefined} onChange={(e) => changeFilter(setTo)(e.target.value)} aria-label="Tạo đến ngày" className={`${field} px-3`} />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>
          {badRange && <p role="alert" className="px-4 pb-3 text-xs text-danger">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}

          <div className="border-t border-line">
            {list.waiting ? (
              <TableSkeleton rows={PAGE_SIZE} label="Đang tải người dùng" />
            ) : list.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">{badRange ? "Khoảng ngày không hợp lệ" : "Không tải được danh sách người dùng"}</p>
                <button onClick={list.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">{hasFilter ? "Không có người dùng phù hợp với bộ lọc." : "Chưa có người dùng nào."}</p>
            ) : (
              <AdminUsersTable
                items={items}
                currentUserId={me?.id ?? null}
                busyId={busyId}
                onView={setViewing}
                onLock={setLocking}
                onUnlock={(u) => void setLocked(u, false)}
              />
            )}
          </div>

          {list.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>Hiển thị {rangeFrom}–{rangeTo} trong {total} người dùng</p>
              {pages > 1 && <Pagination page={page} totalPages={pages} onChange={setPage} />}
            </div>
          )}
        </section>
      </div>

      {viewing && (
        <UserDetailModal
          key={`${viewing.id}-${viewing.role?.id ?? 0}`}
          user={viewing}
          roles={roles}
          isMe={viewing.id === me?.id}
          onChangeRole={changeRole}
          onClose={() => setViewing(null)}
        />
      )}

      {locking && (
        <ConfirmDialog
          title="Khóa tài khoản?"
          message={`Bạn có chắc chắn muốn khóa tài khoản "${locking.fullName ?? locking.email}" không? Người này sẽ bị đăng xuất khỏi mọi thiết bị và không đăng nhập được nữa. Bạn có thể mở khóa lại bất cứ lúc nào.`}
          confirmLabel="Khóa tài khoản"
          busy={busyId === locking.id}
          onConfirm={confirmLock}
          onClose={() => setLocking(null)}
        />
      )}
      {creating && (
        <CreateUserModal roles={roles} submitting={createBusy} onSubmit={(input) => void createUser(input)} onClose={() => setCreating(false)} />
      )}
    </>
  );
}
