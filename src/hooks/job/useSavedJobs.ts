import {
  createElement,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import savedJobService from "../../services/job/savedJobService";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import { selectAuthStatus, useAppSelector } from "../../store";

let savedIds: number[] = [];
let loadState: "none" | "loading" | "done" = "none";
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => savedIds;

const setSavedIds = (next: number[]) => {
  savedIds = next;
  emit();
};

export default function useSavedJobs() {
  const authStatus = useAppSelector(selectAuthStatus);
  const ids = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [askLogin, setAskLogin] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      loadState = "none";
      if (savedIds.length) setSavedIds([]);
      return;
    }
    if (authStatus !== "authenticated" || loadState !== "none") return;

    loadState = "loading";
    savedJobService
      .getIds()
      .then((res) => {
        setSavedIds(res);
        loadState = "done";
      })
      .catch(() => {
        loadState = "none";
      });
  }, [authStatus]);

  const toggle = useCallback(
    async (jobId: number): Promise<boolean> => {
      if (authStatus !== "authenticated") {
        setAskLogin(true);
        return false;
      }
      const wasSaved = savedIds.includes(jobId);
      setSavedIds(
        wasSaved ? savedIds.filter((x) => x !== jobId) : [jobId, ...savedIds]
      );
      try {
        if (wasSaved) await savedJobService.unsave(jobId);
        else await savedJobService.save(jobId);
        return true;
      } catch {
        setSavedIds(
          wasSaved ? [jobId, ...savedIds] : savedIds.filter((x) => x !== jobId)
        );
        return false;
      }
    },
    [authStatus]
  );

  const loginPrompt = askLogin
    ? createElement(AuthRequiredModal, {
        message: "Đăng nhập để lưu tin tuyển dụng và xem lại bất cứ lúc nào.",
        onClose: () => setAskLogin(false),
      })
    : null;

  return { savedIds: ids, toggle, loginPrompt };
}
