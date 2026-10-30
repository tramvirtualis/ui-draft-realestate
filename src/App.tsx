import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import OAuthLoginRedirect from "./components/common/OAuthLoginRedirect";

function App() {
  return (
    <>
      <ScrollToTop />
      <OAuthLoginRedirect />
      <AppRoutes />
    </>
  );

}

export default App;
