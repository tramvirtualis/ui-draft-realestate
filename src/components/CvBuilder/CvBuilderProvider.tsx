import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CvBuilderContext, type CvBuilderState } from "./cvBuilderContext";
import {
  clearDraft,
  isEmptyCv,
  loadDraft,
  normalizeDraft,
  saveDraft,
  type CvDraft,
} from "./cvDraft";
import cvDraftService from "../../services/job/cvDraftService";
import {
  selectAuthStatus,
  selectCurrentUser,
  useAppSelector,
} from "../../store";

import {
  DEFAULT_CV_STYLE,
  EMPTY_CV_DATA,
  type CvData,
  type CvSectionKey,
  type CvStyle,
} from "../../types/job/cv.types";

const AUTOSAVE_MS = 1500;
/** Không lấy được bản nháp trên tài khoản (mất mạng…) thì thử lại sau */
const SYNC_RETRY_MS = 20000;

type CloudStatus = CvBuilderState["cloud"];
const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) || 0 : 0);

/**
 * Giữ dữ liệu CV đang soạn, tự động lưu nháp (debounce), cảnh báo khi đóng tab lúc chưa lưu
 * và lưu nốt khi rời trang. Điền sẵn họ tên, email, ảnh từ tài khoản đang đăng nhập.
 */
export default function CvBuilderProvider({
  children,
}: {
  children: ReactNode;
}) {
  // const { user } = useAuth();

  const [state, setState] = useState(() => {
    const draft = loadDraft();
    const data: CvData = draft?.data ?? EMPTY_CV_DATA;
    const personal = { ...data.personal };
    // chỉ ghi vào trường còn trống để không đè nội dung người dùng đã sửa
    // if (user) {
    //   personal.fullName ||= user.fullName;
    //   personal.email ||= user.email;
    //   personal.avatarUrl ||= user.avatarUrl ?? "";
    // }
    return {
      data: { ...data, personal },
      style: draft?.style ?? DEFAULT_CV_STYLE,
      dirty: false,
      savedAt: draft?.savedAt ?? null,
      editRev: 0,
    };
  });

  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const setSection = useCallback<CvBuilderState["setSection"]>((key, value) => {
    setState((s) => ({
      ...s,
      data: {
        ...s.data,
        [key]:
          typeof value === "function"
            ? (value as (p: unknown) => unknown)(s.data[key])
            : value,
      },
      dirty: true,
    }));
  }, []);

  const setStyle = useCallback((patch: Partial<CvStyle>) => {
    setState((s) => ({ ...s, style: { ...s.style, ...patch }, dirty: true }));
  }, []);

  const updateFromPreview = useCallback((update: (data: CvData) => CvData) => {
    setState((s) => ({
      ...s,
      data: update(s.data),
      dirty: true,
      editRev: s.editRev + 1,
    }));
  }, []);

  const addCustomSection = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      data: {
        ...s.data,
        customSections: [
          ...s.data.customSections,
          { id, title: "Mục tùy chỉnh", content: "" },
        ],
      },
      style: {
        ...s.style,
        sectionOrder: [...s.style.sectionOrder, `custom:${id}` as CvSectionKey],
      },
      dirty: true,
    }));
  }, []);

  const removeCustomSection = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      data: {
        ...s.data,
        customSections: s.data.customSections.filter((c) => c.id !== id),
      },
      style: {
        ...s.style,
        sectionOrder: s.style.sectionOrder.filter((k) => k !== `custom:${id}`),
      },
      dirty: true,
    }));
  }, []);

  // ---- Đồng bộ với tài khoản ----
  const authStatus = useAppSelector(selectAuthStatus);
  const userId = useAppSelector(selectCurrentUser)?.id ?? null;
  const [cloud, setCloud] = useState<CloudStatus>("off");
  const [syncAttempt, setSyncAttempt] = useState(0);
  // Bản nháp đang soạn thuộc tài khoản nào (null = khách); chỉ gán sau khi đã đối chiếu với server
  const owner = useRef<number | null>(null);

  const pushRemote = useCallback((d: CvDraft) => {
    setCloud("syncing");
    cvDraftService
      .save(d)
      .then(() => setCloud("synced"))
      .catch(() => setCloud("error")); // lần lưu sau sẽ thử lại
  }, []);

  const save = useCallback(() => {
    const { data, style } = latest.current;
    const res = saveDraft(data, style, owner.current);
    if (owner.current !== null) pushRemote({ data, style, savedAt: res.savedAt });
    if (res.ok || owner.current !== null)
      setState((s) => ({ ...s, dirty: false, savedAt: res.savedAt }));
    return res.ok;
  }, [pushRemote]);

  const showDraft = useCallback((d: CvDraft | null) => {
    setState((s) => ({
      ...s,
      data: d?.data ?? EMPTY_CV_DATA,
      style: d?.style ?? DEFAULT_CV_STYLE,
      savedAt: d?.savedAt ?? null,
      dirty: false,
      editRev: s.editRev + 1, // form đang mở nạp lại dữ liệu
    }));
  }, []);

  useEffect(() => {
    // Đăng xuất: cất CV vào ô của tài khoản, hiện lại bản nháp của khách
    if (authStatus === "unauthenticated") {
      if (owner.current !== null) {
        const { data, style } = latest.current;
        saveDraft(data, style, owner.current);
        owner.current = null;
        showDraft(loadDraft(null));
      }
      setCloud("off");
      return;
    }
    if (authStatus !== "authenticated" || userId === null || owner.current === userId)
      return;

    // Vừa đăng nhập / mở trang khi đã đăng nhập: chọn bản mới nhất giữa
    // bản đang soạn (khách), bản trên trình duyệt của tài khoản và bản trên server
    let cancelled = false;
    const start = latest.current;
    setCloud("syncing");
    cvDraftService
      .get()
      .then((remoteRaw) => {
        if (cancelled) return;
        const now = latest.current;
        const editedMeanwhile = now.data !== start.data || now.style !== start.style;
        const guest: CvDraft | null = isEmptyCv(now.data)
          ? null
          : {
              data: now.data,
              style: now.style,
              savedAt:
                editedMeanwhile || !now.savedAt ? new Date().toISOString() : now.savedAt,
            };
        const remote = remoteRaw ? normalizeDraft(remoteRaw) : null;
        // bản mới hơn giữa trình duyệt (ô của tài khoản) và server
        const account = [loadDraft(userId), remote]
          .filter((d): d is CvDraft => d !== null)
          .reduce<CvDraft | null>((a, d) => (!a || time(d.savedAt) > time(a.savedAt) ? d : a), null);
        // CV soạn khi chưa đăng nhập chỉ chuyển vào tài khoản chưa có bản nháp (máy dùng chung không
        // ghi đè CV của người khác), trừ khi người dùng vừa gõ thêm trong lúc chờ server
        const best = account && !editedMeanwhile ? account : (guest ?? account);

        owner.current = userId;
        if (!best) {
          showDraft(null);
          setCloud("synced");
          return;
        }
        if (best === guest) clearDraft(null); // CV soạn lúc chưa đăng nhập chuyển sang tài khoản
        else showDraft(best);
        saveDraft(best.data, best.style, userId, best.savedAt);
        if (!remote || time(remote.savedAt) < time(best.savedAt)) pushRemote(best);
        else setCloud("synced");
      })
      .catch(() => {
        if (cancelled) return;
        setCloud("error");
        setTimeout(() => setSyncAttempt((n) => n + 1), SYNC_RETRY_MS);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, userId, syncAttempt, pushRemote, showDraft]);

  // Tự động lưu sau khi ngừng chỉnh sửa
  useEffect(() => {
    if (!state.dirty) return;
    const t = setTimeout(save, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [state.data, state.style, state.dirty, save]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (latest.current.dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (latest.current.dirty) save();
    };
  }, [save]);

  const value = useMemo<CvBuilderState>(
    () => ({
      ...state,
      cloud,
      setSection,
      setStyle,
      updateFromPreview,
      addCustomSection,
      removeCustomSection,
      save,
    }),
    [
      state,
      cloud,
      setSection,
      setStyle,
      updateFromPreview,
      addCustomSection,
      removeCustomSection,
      save,
    ]
  );

  return (
    <CvBuilderContext.Provider value={value}>
      {children}
    </CvBuilderContext.Provider>
  );
}
