type Props = {
  welcome: string;
  title: string;
  subtitle?: string;
};

// Tiêu đề đầu thẻ xác thực (đăng nhập / đăng ký / quên mật khẩu)
export default function AuthHeader({ welcome, title, subtitle }: Props) {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-600">{welcome}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:mt-3 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-body">{subtitle}</p>}
    </>
  );
}
