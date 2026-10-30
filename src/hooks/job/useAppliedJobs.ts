import { useCallback, useEffect, useSyncExternalStore } from "react";
import applicationService from "../../services/job/applicationService";
import { selectAuthStatus, useAppSelector } from "../../store";
import type { Application } from "../../types/applicationHistory.types";

/**
 Tập jobId người dùng đã ứng tuyển, dùng chung cho mọi JobCard / trang chi tiết.
 Khớp luật BE: đơn đã rút (WITHDRAWN) thì được nộp lại → không tính là đã ứng tuyển.
 Tải 1 lần sau khi đăng nhập; đăng xuất thì xoá.
 */
const FETCH_SIZE = 500;

let applied = new Set<number>();
let loadedFor: "none" | "loading" | "done" = "none";
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => applied;

const setApplied = (next: Set<number>) => {
  applied = next;
  emit();
};

// Đồng bộ lại từ danh sách đơn (vd sau khi rút đơn ở trang lịch sử) 
export const syncAppliedJobs = (items: Application[]) =>
  setApplied(new Set(items.filter((a) => a.status !== "WITHDRAWN" && a.job).map((a) => a.job!.id)));

export function useAppliedJobs() {
  const authStatus = useAppSelector(selectAuthStatus);
  const appliedIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      loadedFor = "none";
      if (applied.size) setApplied(new Set());
      return;
    }
    if (authStatus !== "authenticated" || loadedFor !== "none") return;

    loadedFor = "loading";
    applicationService
      .getMyApplications(0, FETCH_SIZE)
      .then((res) => {
        syncAppliedJobs(res.content);
        loadedFor = "done";
      })
      .catch(() => {
        loadedFor = "none"; // lỗi thì lần sau thử lại
      });
  }, [authStatus]);

  const markApplied = useCallback((jobId: number) => setApplied(new Set(applied).add(jobId)), []);
  const isApplied = useCallback((jobId: number) => appliedIds.has(jobId), [appliedIds]);

  return { isApplied, markApplied };
}
