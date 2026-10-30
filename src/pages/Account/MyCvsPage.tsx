import { useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import ToastProvider from "../../components/common/Toast";
import { useToast } from "../../components/common/toastContext";
import MyCvCard from "../../components/MyCvs/MyCvCard";
import MyCvUploadForm from "../../components/MyCvs/MyCvUploadForm";
import { useMyCvs } from "../../hooks/job/useMyCvs";
import { getErrorMessage } from "../../api/http";

const TITLE = "CV của tôi | NovaLand Hub";

// "CV của tôi": tải CV lên lưu sẵn để chọn khi ứng tuyển (/me/cvs)
function MyCvs() {
  const toast = useToast();
  const { cvs, loading, error, upload, rename, setDefault, remove } =
    useMyCvs();
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = async (
    id: number,
    action: () => Promise<void>,
    success: string
  ) => {
    setBusyId(id);
    try {
      await action();
      toast.show(success);
      return true;
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Tài khoản", to: "/account" },
          { label: "CV của tôi" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-heading md:text-4xl">
            CV của tôi
          </h1>
          <p className="mt-2 text-sm text-body">
            {cvs.length > 0
              ? `${cvs.length} CV đã lưu. CV mặc định được chọn sẵn khi bạn ứng tuyển.`
              : "Tải CV lên một lần, dùng lại cho mọi lần ứng tuyển."}
          </p>
        </div>
        <Link
          to="/jobs/create-cv"
          className="flex h-11 items-center gap-2 rounded-full border border-primary-200 px-5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <FilePlus2 size={15} aria-hidden /> Tạo CV online
        </Link>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Danh sách CV" className="order-2 xl:order-1">
          {loading ? (
            <div
              className="space-y-3"
              aria-busy="true"
              aria-label="Đang tải CV"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-primary-50/60"
                />
              ))}
            </div>
          ) : error ? (
            <p
              role="alert"
              className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-500"
            >
              {error}
            </p>
          ) : cvs.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-line px-6 py-12 text-center text-sm text-body">
              Bạn chưa lưu CV nào. Tải CV đầu tiên lên ở khung bên cạnh, CV này
              sẽ tự động là CV mặc định.
            </p>
          ) : (
            <div className="space-y-3">
              {cvs.map((cv) => (
                <MyCvCard
                  key={cv.id}
                  cv={cv}
                  busy={busyId === cv.id}
                  onRename={(title) =>
                    run(cv.id, () => rename(cv.id, title), "Đã đổi tên CV")
                  }
                  onSetDefault={() =>
                    run(
                      cv.id,
                      () => setDefault(cv.id),
                      `Đã đặt "${cv.title}" làm CV mặc định`
                    )
                  }
                  onDelete={() => {
                    if (
                      !window.confirm(
                        `Xóa CV "${cv.title}"? Các đơn đã nộp bằng CV này vẫn giữ nguyên.`
                      )
                    )
                      return;
                    run(cv.id, () => remove(cv.id), "Đã xóa CV");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="order-1 xl:order-2 xl:sticky xl:top-28">
          <MyCvUploadForm
            hasCvs={cvs.length > 0}
            onUpload={upload}
            onUploaded={(cv) => toast.show(`Đã lưu "${cv.title}"`)}
          />
        </div>
      </div>
    </>
  );
}

export default function MyCvsPage() {
  return (
    <ToastProvider>
      <MyCvs />
    </ToastProvider>
  );
}
