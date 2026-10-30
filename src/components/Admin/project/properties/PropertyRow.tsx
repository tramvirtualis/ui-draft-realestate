import { Eye, Pencil, Trash2 } from "lucide-react";
import PropertyStatusMenu from "./PropertyStatusMenu";
import { formatArea, formatPrice } from "./propertyFormat";
import type { Property, PropertyStatus } from "../../../../types/project/property.types";

type Props = {
  property: Property;
  index: number;
  highRise: boolean;
  zoneName: string;
  buildingName: string | null; // tòa nhà (chỉ căn cao tầng)
  onView: (p: Property) => void;
  onEdit: (p: Property) => void;
  onStatus: (p: Property, s: PropertyStatus) => void;
  onDelete: (p: Property) => void;
};

const btn = "flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";
const cell = "whitespace-nowrap px-4 py-3";

// Một dòng căn; dự án cao tầng có thêm vị trí trong tòa (tòa, tầng, trục, phân khu) và số phòng ngủ
export default function PropertyRow({ property: p, index, highRise, zoneName, buildingName, onView, onEdit, onStatus, onDelete }: Props) {
  return (
    <tr className="border-t border-line transition hover:bg-primary-50/70">
      <td className="px-4 py-3 text-body first:pl-6">{String(index).padStart(2, "0")}</td>
      <td className={cell}>
        <button onClick={() => onView(p)} className="text-base font-bold text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">{p.propertyCode}</button>
      </td>
      {highRise ? (
        <>
          <td className={cell}>
            <p className="font-semibold text-footer">
              {buildingName ? `Tòa ${buildingName}` : "Chưa gắn tòa"}
              {p.floor != null && <span className="font-normal text-body"> · Tầng {p.floor}</span>}
              {p.axis && <span className="font-normal text-body"> · Trục {p.axis}</span>}
            </p>
            <p className="text-xs text-body">Phân khu {zoneName}</p>
          </td>
          <td className={`${cell} text-body`}>{p.bedrooms == null ? "—" : p.bedrooms === 0 ? "Studio" : `${p.bedrooms} PN`}</td>
        </>
      ) : (
        <td className={`${cell} text-heading`}>{zoneName}</td>
      )}
      <td className={`${cell} text-body`}>{p.type || "—"}</td>
      <td className={`${cell} text-heading`}>{formatArea(p.area)}</td>
      <td className={`${cell} font-semibold text-footer`}>{formatPrice(p.price)}</td>
      <td className={`${cell} text-body`}>{p.direction || "—"}</td>
      <td className="px-4 py-3">
        <PropertyStatusMenu status={p.status} label={p.propertyCode} onChange={(s) => onStatus(p, s)} />
      </td>
      <td className="px-4 py-3 last:pr-6">
        <div className="flex gap-1.5">
          <button onClick={() => onView(p)} aria-label={`Xem ${p.propertyCode}`} title="Xem chi tiết" className={`${btn} text-primary-600`}><Eye size={15} /></button>
          <button onClick={() => onEdit(p)} aria-label={`Sửa ${p.propertyCode}`} title="Chỉnh sửa" className={`${btn} text-accent`}><Pencil size={15} /></button>
          <button onClick={() => onDelete(p)} aria-label={`Xóa ${p.propertyCode}`} title="Xóa" className={`${btn} text-danger`}><Trash2 size={15} /></button>
        </div>
      </td>
    </tr>
  );
}
