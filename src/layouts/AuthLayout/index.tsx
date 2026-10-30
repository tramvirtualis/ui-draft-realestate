import { Link, Outlet, useLocation } from "react-router-dom";
import Auth3DScene from "../../components/Auth/Auth3DScene";
import TiltCard from "../../components/Auth/TiltCard";
import { FORGOT_PASSWORD_COPY, LOGIN_COPY, REGISTER_COPY } from "../../data/authContent";
import HubtechLogo from "../../components/Home/HubtechLogo";

// Dòng chuyển trang bên dưới thẻ, theo từng trang
const SWITCH_LINKS: Record<string, { text: string; label: string; to: string }> = {
  "/login": { text: LOGIN_COPY.noAccount, label: LOGIN_COPY.register, to: "/register" },
  "/register": { text: REGISTER_COPY.hasAccount, label: REGISTER_COPY.login, to: "/login" },
  "/forgot-password": { text: FORGOT_PASSWORD_COPY.remembered, label: FORGOT_PASSWORD_COPY.login, to: "/login" },
};

// Khung chung cho đăng nhập / đăng ký / quên mật khẩu: nền + khu đô thị 3D giữ nguyên,
// chỉ thẻ bên phải lật sang nội dung mới khi đổi trang
export default function AuthLayout() {
  const { pathname } = useLocation();
  const switchLink = SWITCH_LINKS[pathname];

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary-600/30 blur-[120px]" />
        <div className="absolute -bottom-48 right-0 h-[560px] w-[560px] rounded-full bg-primary-300/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-4 py-6 sm:py-10 lg:gap-10 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        {/* ===== Trái: thương hiệu + khu đô thị 3D (ẩn trên mobile) ===== */}
        <section className="hidden lg:block">
          {/* Logo Hubtech (cùng logo header), nét trắng trên nền tối */}
          <Link to="/" aria-label="Về trang chủ Hubtech" className="inline-flex text-white">
            <HubtechLogo />
          </Link>
          <h2 className="relative z-10 mt-8 max-w-md text-4xl [@media(max-height:860px)]:mt-5 [@media(max-height:860px)]:text-3xl font-bold leading-tight tracking-tight text-white">
            Không gian sống{" "}
            <span className="bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
              trong tầm tay
            </span>{" "}
            bạn
          </h2>
          <p className="relative z-10 mt-3 max-w-md text-sm leading-relaxed text-white/60">
            Theo dõi dự án, đăng ký sự kiện và cập nhật thị trường bất động sản — tất cả trong một tài khoản.
          </p>
          <Auth3DScene />
        </section>

        <section className="mx-auto w-full max-w-[460px]">
          {/* Logo cho mobile (cột trái bị ẩn) */}
          <Link to="/" aria-label="Về trang chủ Hubtech" className="mb-5 flex justify-center text-white lg:hidden">
            <HubtechLogo />
          </Link>

          {/* key theo trang → thẻ được dựng lại và chạy hiệu ứng lật mỗi lần đổi trang */}
          <div key={pathname} className="animate-auth-card-flip">
            <TiltCard>
              <div className="p-5 sm:p-10 [@media(min-width:640px)_and_(max-height:820px)]:p-7">
                <Outlet />
              </div>
            </TiltCard>
          </div>

          {switchLink && (
            <p className="mt-6 text-center text-sm text-white/70">
              {switchLink.text}{" "}
              <Link
                to={switchLink.to}
                className="font-bold text-white underline underline-offset-4 hover:text-primary-300"
              >
                {switchLink.label}
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
