import PropertyRow from "./PropertyRow";
import type { Property, PropertyCatalog, PropertyStatus } from "../../../../types/project/property.types";

type Props = {
  properties: Property[]; // đã cắt theo trang
  startIndex: number;
  catalog: PropertyCatalog;
  highRise: boolean; // dự án cao tầng: thêm cột vị trí trong tòa (tòa · tầng · trục) và phòng ngủ
  onView: (p: Property) => void;
  onEdit: (p: Property) => void;
  onStatus: (p: Property, s: PropertyStatus) => void;
  onDelete: (p: Property) => void;
};

// Cột theo loại hình xây dựng; bảng nằm trong trang quỹ căn của một dự án nên không lặp lại tên dự án
const LOW_RISE_COLUMNS = ["STT", "Mã căn", "Phân khu", "Loại hình", "Diện tích", "Giá bán", "Hướng", "Trạng thái", "Thao tác"];
const HIGH_RISE_COLUMNS = ["STT", "Mã căn", "Vị trí", "Phòng ngủ", "Loại hình", "Diện tích", "Giá bán", "Hướng", "Trạng thái", "Thao tác"];

export default function PropertyTable({ properties, startIndex, catalog, highRise, ...actions }: Props) {
  const columns = highRise ? HIGH_RISE_COLUMNS : LOW_RISE_COLUMNS;
  return (
    <div className="-mx-6 overflow-x-auto">
      <table className={`w-full text-left text-sm ${highRise ? "min-w-[1080px]" : "min-w-[900px]"}`}>
        <thead>
          <tr className="bg-primary-50/50 text-[11px] uppercase text-heading">
            {columns.map((c) => <th key={c} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold first:pl-6 last:pr-6">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {properties.map((p, i) => (
            <PropertyRow
              key={p.id}
              property={p}
              index={startIndex + i + 1}
              highRise={highRise}
              zoneName={catalog.zones.find((z) => z.id === p.zoneId)?.name ?? "Chưa cập nhật"}
              buildingName={catalog.buildings.find((b) => b.id === p.buildingId)?.name ?? null}
              {...actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
