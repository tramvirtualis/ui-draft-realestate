import { Navigate, useLocation } from "react-router-dom";
import ToastProvider from "../../components/common/Toast";
import CvBuilderProvider from "../../components/CvBuilder/CvBuilderProvider";
import CvBuilderWorkspace from "../../components/CvBuilder/CvBuilderWorkspace";

const TITLE = "Tạo CV bất động sản | NovaLand Hub";

export default function CvBuilderPage() {
  const { pathname, search } = useLocation();
  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      <ToastProvider>
        <CvBuilderProvider>
          <CvBuilderWorkspace />
        </CvBuilderProvider>
      </ToastProvider>
    </>
  );
}
