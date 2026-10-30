import type { AdminProject, AdminZone } from "../../types/project/adminProject.types";

// TODO: thay bằng dữ liệu gọi từ API (Projects + Project_types + Zones cho trang quản trị)
const small = (id: string) => `https://images.unsplash.com/${id}?w=200&q=80`;
const big = (id: string) => `https://images.unsplash.com/${id}?w=1600&q=80`;

// status của Zones là chuỗi tự do; đây chỉ là các gợi ý trong form
export const ZONE_STATUSES = ["Đang lập kế hoạch", "Đang xây dựng", "Đã bàn giao"];
export const BUILDING_TYPES = ["Cao tầng", "Thấp tầng"];

const zone = (id: number, name: string, description: string, status: string, imageUrl: string | null): AdminZone => ({ id, name, description, status, imageUrl });

type Row = Pick<AdminProject, "id" | "name" | "investor" | "location" | "buildingType" | "overviewImage" | "createdAt"> & Partial<AdminProject>;

// Các trường còn lại mặc định rỗng
const row = (r: Row): AdminProject => ({
  consultancy: "", developmentModel: "", size: "", totalInvestment: "", ownershipType: "", types: [], zones: [], banks: [], hidden: false, status: "PUBLISHED", bookingEnabled: true,
  ...r,
});

export const MOCK_ADMIN_PROJECTS: AdminProject[] = [
  row({ id: 1, name: "The Lumen Riverside", investor: "Masterise Homes", location: "Thủ Thiêm, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1545324418-cc1a3fa10c00"), createdAt: "2026-10-02",
    consultancy: "CBRE Việt Nam", developmentModel: "Khu căn hộ ven sông", size: "6,4 ha", totalInvestment: "9.800 tỷ VNĐ", ownershipType: "Sở hữu lâu dài", types: ["Căn hộ"],
    zones: [zone(1, "Lumen Central", "Khu căn hộ trung tâm nhìn ra công viên ven sông.", "Đang mở bán", small("photo-1545324418-cc1a3fa10c00")), zone(2, "Lumen Park", "Khu căn hộ liền kề công viên nội khu.", "Sắp mở bán", small("photo-1486406146926-c627a92ad1ab"))] }),
  row({ id: 2, name: "Aurelia Riverside", investor: "Aurelia Land", location: "Đại lộ Vòng Cung, Thủ Thiêm, TP.HCM", buildingType: "Căn hộ · Shophouse", overviewImage: big("photo-1545324418-cc1a3fa10c00"), createdAt: "2026-10-01",
    consultancy: "Savills Việt Nam", developmentModel: "Khu đô thị ven sông thế hệ mới", size: "18,6 ha", totalInvestment: "25.000 tỷ VNĐ", ownershipType: "Sở hữu lâu dài", types: ["Căn hộ", "Duplex", "Shophouse"],
    zones: [
      zone(1, "Aurelia Central", "Phân khu trung tâm với các tòa căn hộ cao tầng.", "Đang mở bán", big("photo-1545324418-cc1a3fa10c00")),
      zone(2, "Aurelia Riverfront", "Dải căn hộ mặt nước và phố thương mại ven sông.", "Đang mở bán", big("photo-1512917774080-9991f1c4c750")),
      zone(3, "Aurelia Skyline", "Các tòa tháp cao tầng với tầm nhìn toàn cảnh.", "Sắp mở bán", big("photo-1486406146926-c627a92ad1ab")),
      zone(4, "Aurelia Garden", "Khu căn hộ thấp tầng hòa vào cảnh quan xanh.", "Sắp mở bán", big("photo-1600585154340-be6161a56a0c")),
    ] }),
  row({ id: 3, name: "The Metropole Thủ Thiêm", investor: "SonKim Land", location: "Thủ Thiêm, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1486406146926-c627a92ad1ab"), createdAt: "2026-09-28" }),
  row({ id: 4, name: "Aurelia Marina", investor: "Aurelia Land", location: "Quận 1, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1600585154340-be6161a56a0c"), createdAt: "2026-09-25" }),
  row({ id: 5, name: "The River Promenade", investor: "SonKim Land", location: "Bình Thạnh, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1600607687939-ce8a6c25118c"), createdAt: "2026-09-20" }),
  row({ id: 6, name: "Lumen Garden Villas", investor: "Masterise Homes", location: "Thủ Đức, TP.HCM", buildingType: "Biệt thự", overviewImage: small("photo-1613490493576-7fde63acd811"), createdAt: "2026-09-18" }),
  row({ id: 7, name: "Maison Heritage", investor: "SonKim Land", location: "Quận 3, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1545324418-cc1a3fa10c00"), createdAt: "2026-09-12" }),
  row({ id: 8, name: "Grand Marina Saigon", investor: "Masterise Homes", location: "Quận 1, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1486406146926-c627a92ad1ab"), createdAt: "2026-09-05" }),
  row({ id: 9, name: "The Zenity", investor: "CapitaLand Development", location: "Quận 1, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1600585154340-be6161a56a0c"), createdAt: "2026-08-30" }),
  row({ id: 10, name: "Aurora Bay Residences", investor: "Keppel Land", location: "Thủ Thiêm, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1512917774080-9991f1c4c750"), createdAt: "2026-08-22" }),
  row({ id: 11, name: "Lâm Viên Eco Townhouse", investor: "Aurelia Land", location: "Thủ Đức, TP.HCM", buildingType: "Nhà phố", overviewImage: small("photo-1600607687939-ce8a6c25118c"), createdAt: "2026-08-15" }),
  row({ id: 12, name: "Bến Thuyền Residence", investor: "Keppel Land", location: "Bình Thạnh, TP.HCM", buildingType: "Căn hộ", overviewImage: small("photo-1613490493576-7fde63acd811"), createdAt: "2026-08-02" }),
];
