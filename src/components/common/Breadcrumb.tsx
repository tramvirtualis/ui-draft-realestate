import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string; // không có `to` => mục hiện tại
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-body" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} aria-hidden />}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-600">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-medium text-primary-600">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
