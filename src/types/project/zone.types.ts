// Bám theo bảng Zones (project_id → Projects.id; Properties.zone_id → Zones.id)

export interface Zone {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  status: string | null;
  imageUrl: string | null;
  // Chỉ có khi API trả về số bất động sản thuộc phân khu (từ Properties.zone_id)
  propertyCount: number | null;
}

export interface ZoneProject {
  id: number;
  name: string;
  location: string;
  investor: string;
  image: string;
}

export interface ProjectZones {
  project: ZoneProject;
  zones: Zone[];
}
