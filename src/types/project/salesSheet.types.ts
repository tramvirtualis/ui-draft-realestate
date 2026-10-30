import type { FundType } from "./project.types";

export interface SalesSheetSummary {
  id: number;
  projectId: number;
  zoneId: number | null;
  zoneName?: string | null;
  buildingId?: number | null;
  buildingName?: string | null;
  code: string;
  name: string;
  status: string;
  displayOrder?: number | null;
  hasPdf: boolean;
  hasImage: boolean;
  pinCount: number;
}

export interface SalesSheetPin {
  id: number;
  propertyId: number;
  propertyCode: string;
  price?: number | null;
  area?: number | null;
  status: string;
  fundType: FundType | null;
  x: number;
  y: number;
}

export interface SalesSheetDetail {
  id: number;
  projectId: number;
  zoneId: number | null;
  zoneName?: string | null;
  buildingId?: number | null;
  buildingName?: string | null;
  code: string;
  name: string;
  pdfUrl?: string | null;
  pdfPage?: number | null;
  pdfWarning?: string | null;
  imageUrl?: string | null;
  tileBaseUrl?: string | null;
  tileLevels?: number | null;
  tileWidth?: number | null;
  tileHeight?: number | null;
  pinScale: number;
  status: string;
  displayOrder?: number | null;
  pins: SalesSheetPin[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesSheetInput {
  projectId: number;
  zoneId?: number | null;
  buildingId?: number | null;
  code: string;
  name: string;
  status?: string;
  displayOrder?: number;
}

export interface SalesSheetPinInput {
  propertyId: number;
  fundType?: FundType | null;
  x: number;
  y: number;
}
