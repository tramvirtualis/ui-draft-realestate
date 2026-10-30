import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { isExternalLink } from "../../../types/social/socialAd.types";

type Props = { href: string; className?: string; children: ReactNode };

// Link của quảng cáo: trang web khác thì mở tab mới, đường dẫn trong web thì chuyển trang luôn
export default function AdLink({ href, className, children }: Props) {
  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer sponsored" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
