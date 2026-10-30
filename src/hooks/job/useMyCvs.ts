import { useCallback, useEffect, useState } from "react";
import cvService from "../../services/job/cvService";
import { getErrorMessage } from "../../api/http";
import type { CvRequest, MyCv } from "../../types/job/myCv.types";

// CV đã tải lên của người đang đăng nhập (enabled = false khi chưa đăng nhập)
export function useMyCvs(enabled = true) {
  const [cvs, setCvs] = useState<MyCv[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setError(null);

    cvService
      .getMyCvs(0, 50)
      .then((res) => !ignore && setCvs(res.content))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [enabled, version]);

  // Tải lại sau mỗi thao tác vì đổi CV mặc định / xóa CV làm thay đổi cả các CV khác
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const upload = useCallback(
    async (request: CvRequest, file: File) => {
      const cv = await cvService.upload(request, file);
      reload();
      return cv;
    },
    [reload]
  );

  const rename = useCallback(
    async (id: number, title: string) => {
      await cvService.updateCv(id, { title });
      reload();
    },
    [reload]
  );

  const setDefault = useCallback(
    async (id: number) => {
      await cvService.setDefault(id);
      reload();
    },
    [reload]
  );

  const remove = useCallback(
    async (id: number) => {
      await cvService.deleteCv(id);
      reload();
    },
    [reload]
  );

  return { cvs, loading, error, reload, upload, rename, setDefault, remove };
}
