import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SOCIAL_MENU, type SocialMenuItem } from "./socialMenuItems";
import { selectIsAuthenticated, useAppSelector } from "../../store";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
};

// Menu trang Cộng đồng: mỗi mục có icon trong ô bo tròn; mục đang chọn có vạch vàng bên trái + ô icon navy
export default function SocialMenu({ activeId, onSelect }: Props) {
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const items = SOCIAL_MENU.filter((item) => isLoggedIn || !item.requiresAuth);

  const body = (item: SocialMenuItem, active: boolean) => {
    const Icon = item.icon;
    return (
      <>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${
            active ? `${item.tone.solid} shadow-md` : item.tone.soft
          }`}
        >
          <Icon size={17} aria-hidden />
        </span>
        <span className="flex-1">{item.label}</span>
        {item.path && <ArrowUpRight size={15} className="text-muted opacity-0 transition group-hover:opacity-100" aria-hidden />}
      </>
    );
  };

  const itemClass = (item: SocialMenuItem, active: boolean) =>
    `group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition ${
      active
        ? `bg-page text-heading font-semibold before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-full before:content-[''] ${item.tone.bar}`
        : "text-body hover:bg-page hover:text-heading"
    }`;

  return (
    <nav className="space-y-1 rounded-2xl border border-line bg-white p-2.5">
      {items.map((item) =>
        item.path ? (
          <Link key={item.id} to={item.path} className={itemClass(item, false)}>
            {body(item, false)}
          </Link>
        ) : (
          <button key={item.id} onClick={() => onSelect(item.id)} className={itemClass(item, activeId === item.id)}>
            {body(item, activeId === item.id)}
          </button>
        ),
      )}
    </nav>
  );
}
